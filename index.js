import pinyin from 'pinyin';

const kChild = '__treechild__';
const kParent = '__treeparent__';
const kPinyin = '__pinyin__';
const kFLPinyin = '__firstletterpinyin__';

export const SelectType = {
    NotSelect: 0,
    IncompleteSelect: 0.5,
    FullSelect: 1,
};

const Tree = class {
    constructor(
        root,
        parent = undefined,
        childrenKey = 'children',
        idKey = 'id',
        onStatusChange = undefined,
        normalPinyinKeys = [],
        firstLetterPinyinKeys = []
    ) {
        this.idKey = idKey;
        this.root = {...root};
        this.root[kParent] = parent;
        this.root[kPinyin] = {};
        normalPinyinKeys.forEach(key => {
            const rPinyin = pinyin(String(this.root[key]), {
                style: pinyin.STYLE_NORMAL,
                heteronym: true
            });
            this.root[kPinyin][key] = rPinyin.map(item => item[0]).join('');
        });
        this.root[kFLPinyin] = {};
        firstLetterPinyinKeys.forEach(key => {
            const rPinyin = pinyin(String(this.root[key]), {
                style: pinyin.STYLE_FIRST_LETTER,
                heteronym: true
            });
            this.root[kFLPinyin][key] = rPinyin.map(item => item[0]).join('');
        });
        this.root[kChild] = this.root[childrenKey] ?
            this.root[childrenKey].map(item => {
                return new Tree(
                    item, this, childrenKey, idKey, onStatusChange,
                    normalPinyinKeys, firstLetterPinyinKeys
                );
            }) : undefined;
        this.onStatusChange = onStatusChange;
        this.isSelected = SelectType.NotSelect;
    }

    isLeaf = () => this.root[kChild] === undefined;

    isFullSelect = (cascade = true) => this.selectStatus(cascade) === SelectType.FullSelect;
    isNotSelect = (cascade = true) => this.selectStatus(cascade) === SelectType.NotSelect;
    isIncompleteSelect = (cascade = true) => this.selectStatus(cascade) === SelectType.IncompleteSelect;

    selectStatus = (cascade = true) => {
        if (this.isLeaf() || !cascade) {
            return this.isSelected;
        } else {
            const selectedLeafs = this.getSelectedLeafCount();
            const leafCount = this.getLeafCount();
            if (selectedLeafs === 0 && leafCount !== selectedLeafs) {
                return SelectType.NotSelect;
            } else if (leafCount === selectedLeafs) {
                return SelectType.FullSelect;
            } else {
                return SelectType.IncompleteSelect;
            }
        }
    };

    getLeafCount = () => {
        if (this.isLeaf()) {
            return 1;
        } else {
            return this.root[kChild].reduce((prv, cur) => prv + cur.getLeafCount(), 0);
        }
    };

    getSelectedLeafCount = () => {
        if (this.isLeaf()) {
            return this.isSelected;
        } else {
            return this.root[kChild].reduce((prv, cur) => prv + cur.getSelectedLeafCount(), 0);
        }
    };

    getDeepth = () => {
        if (this.isLeaf()) {
            return 1;
        } else {
            return 1 + this.root[kChild].reduce((prv, cur) => {
                const curDeepth = cur.getDeepth();
                if (curDeepth > prv) {
                    return curDeepth;
                } else {
                    return prv;
                }
            }, 0);
        }
    };

    getInfo = () => ({
        ...this.root,
        [kChild]: undefined,
        [kParent]: undefined,
        [kPinyin]: undefined,
        [kFLPinyin]: undefined,
    });

    getId = () => this.root[this.idKey];
    getParent = () => this.root[kParent];
    getChildren = () => this.root[kChild];
    getPinyin = (key) => this.root[kPinyin][key];
    getFirstLetterPinyin = (key) => this.root[kFLPinyin][key];

    getSplitChildren = (sort, split) => {
        split = split || ((childs, sort) => {
            const notLeafs = [], leafs = [];
            childs.forEach(item => {
                if (item.isLeaf()) {
                    notLeafs.push(item);
                } else {
                    leafs.push(item);
                }
            });
            return sort ? [notLeafs.sort(sort), leafs.sort(sort)] : [notLeafs, leafs];
        });
        return split(this.getChildren(), sort);
    };

    getLeafChildren = () => {
        if (this.isLeaf()) {
            return [this];
        } else {
            return this.getChildren().reduce((prv, cur) => {
                const leafs = cur.getLeafChildren();
                return [...prv, ...leafs];
            }, []);
        }
    };

    setInitialState = (selectedIds, cascade = true) => {
        const result = [];
        if (Array.isArray(selectedIds) && selectedIds.length > 0) {
            selectedIds = selectedIds.map(item => this._stringId(item));
            if (selectedIds.indexOf(this._getStringId()) >= 0) {
                this.update(cascade);
                result.push(this);
            } else if (!this.isLeaf()) {
                this.getChildren().forEach(subNode => {
                    const r = subNode.setInitialState(selectedIds, cascade);
                    r.forEach(item => result.push(item));
                });
            }
        }
        return result;
    };

    update = (cascade = true) => {
        if (this.isLeaf()) {
            this.isSelected = 1 - this.isSelected;
        } else {
            this.isSelected = this.selectStatus(cascade) < 1 ? 1 : 0;
            cascade && this.getChildren().forEach(treeNode => treeNode._fromUpNotification(this.isSelected));
        }
        cascade && this.getParent() && this.getParent()._fromDownNotification();
        this._onStatusChange();
    };

    search = (text, keys, multiselect, exactly = false, canSearch = true) => {
        if (!exactly) {
            text = text.toLowerCase();
        }
        const result = [];
        if (canSearch && (multiselect || this.isLeaf())) {
            const allKeys = [
                ...keys,
                ...Object.keys(this.root[kPinyin]),
                ...Object.keys(this.root[kFLPinyin])
            ];
            const uniqueKeys = Array.from(new Set(allKeys));
            const isContain = uniqueKeys.some(key => {
                if (this.root[key] &&
                    this.root[key].toLowerCase().indexOf(text) >= 0) {
                    return true;
                }
                if (this.root[kPinyin][key] &&
                    this.root[kPinyin][key].toLowerCase().indexOf(text) >= 0) {
                    return true;
                }
                if (this.root[kFLPinyin][key] &&
                    this.root[kFLPinyin][key].toLowerCase().indexOf(text) >= 0) {
                    return true;
                }
                return false;
            });
            if (isContain) {
                result.push(this);
            }
        }
        if (!this.isLeaf()) {
            this.getChildren().forEach(child => {
                const chresult = child.search(text, keys, multiselect, exactly);
                chresult.forEach(item => result.push(item));
            });
        }
        return result;
    };

    hasAncestor = (ancestor) => {
        const parent = this.getParent();
        if (parent) {
            return ancestor._getStringId() === parent._getStringId()
                || parent.hasAncestor(ancestor);
        } else {
            return false;
        }
    };

    findById = (childId) => {
        if (this._getStringId() === this._stringId(childId)) {
            return [this];
        } else if (this.isLeaf()) {
            return undefined;
        } else {
            return [undefined, ...this.getChildren()].reduce((prv, cur) => {
                const r = cur.findById(childId);
                if (r) {
                    return prv ? [...prv, ...r] : [...r];
                } else {
                    return prv;
                }
            });
        }
    };

    _fromUpNotification = (status) => {
        if (this.isLeaf()) {
            this.isSelected = status;
        } else {
            this.getChildren().forEach(treeNode => treeNode._fromUpNotification(status));
        }
        this._onStatusChange();
    };

    _fromDownNotification = () => {
        this._onStatusChange();
        this.getParent() && this.getParent()._fromDownNotification();
    };

    _onStatusChange = () => {
        this.onStatusChange && this.onStatusChange(this);
    };

    _getStringId = () => this._stringId(this.getId());
    
    _stringId = (id) => {
        if (id === undefined || id === null) {
            throw new Error('Identifier can not be null or undefined');
        }
        if (typeof id === 'string') {
            return id;
        }
        if (typeof id === 'number') {
            return String(id);
        }
        return JSON.stringify(id);
    };
};

export default Tree;