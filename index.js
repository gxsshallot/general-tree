const kChild = '__treechild__';
const kParent = '__treeparent__';

export const NotSelect = 0;
export const IncompleteSelect = 0.5;
export const FullSelect = 1;

const Tree = class {
    constructor(
        root,
        parent = undefined,
        childrenKey = 'children',
        idKey = 'id',
        onStatusChange = undefined
    ) {
        this.idKey = idKey;
        this.root = {};
        this.root.info = root || {};
        this.root.path = (parent ? parent.getPath() : '') + '/' + this.getStringId();
        this.root[kParent] = parent;
        this.root[kChild] = this.root.info[childrenKey] ?
            this.root.info[childrenKey].map(item => {
                return new Tree(item, this, childrenKey, idKey, onStatusChange);
            }) : undefined;
        this.onStatusChange = onStatusChange;
        this.isSelected = NotSelect;
    }

    isLeaf() {
        return this.getChildren() === undefined;
    }
    isEqual(treeNode) {
        return this.getStringId() === treeNode.getStringId();
    }

    isFullSelect(cascade = true) {
        return this.selectStatus(cascade) === FullSelect;
    }
    isNotSelect(cascade = true) {
        return this.selectStatus(cascade) === NotSelect;
    }
    isIncompleteSelect(cascade = true) {
        return this.selectStatus(cascade) === IncompleteSelect;
    }

    selectStatus(cascade = true) {
        if (this.isLeaf() || !cascade) {
            return this.isSelected;
        } else {
            const leafCount = this.getLeafCount();
            if (leafCount === 0) {
                return this.isSelected;
            }
            const selectedLeafs = this.getSelectedLeafCount();
            if (leafCount > selectedLeafs) {
                if (selectedLeafs === 0) {
                    return NotSelect;
                } else {
                    return IncompleteSelect;
                }
            } else {
                const func = (treeNode) => {
                    if (treeNode.isLeaf()) {
                        return false;
                    } else if (treeNode.getLeafCount() === 0) {
                        return treeNode.isSelected === NotSelect;
                    } else {
                        return treeNode.getChildren()
                            .reduce((prv, cur) => prv || func(cur), false);
                    }
                };
                if (func(this)) {
                    return IncompleteSelect;
                } else {
                    return FullSelect;
                }
            }
        }
    }

    getLeafCount() {
        if (this.isLeaf()) {
            return 1;
        } else {
            return this.getChildren()
                .reduce((prv, cur) => prv + cur.getLeafCount(), 0);
        }
    }

    getSelectedLeafCount() {
        if (this.isLeaf()) {
            return this.isSelected;
        } else {
            return this.getChildren()
                .reduce((prv, cur) => prv + cur.getSelectedLeafCount(), 0);
        }
    }

    getDeepth() {
        if (this.isLeaf()) {
            return 1;
        } else {
            return 1 + this.getChildren()
                .reduce((prv, cur) => {
                    const curDeepth = cur.getDeepth();
                    if (curDeepth > prv) {
                        return curDeepth;
                    } else {
                        return prv;
                    }
                }, 0);
        }
    }

    getInfo() {
        return this.root.info;
    }
    getId() {
        return this.root.info[this.idKey];
    }
    getStringId() {
        return this._stringId(this.getId());
    }
    getParent() {
        return this.root[kParent];
    }
    getChildren() {
        return this.root[kChild];
    }
    getPath() {
        return this.root.path;
    }

    getLeafChildren() {
        if (this.isLeaf()) {
            return [this];
        } else {
            return this.getChildren()
                .reduce((prv, cur) => {
                    prv.push(...cur.getLeafChildren());
                    return prv;
                }, []);
        }
    }

    getLeafChildrenCount() {
        if (this.root.leafCount !== undefined) {
            return this.root.leafCount;
        }
        let count;
        if (this.isLeaf()) {
            count = 1;
        } else {
            count = this.getChildren()
                .reduce((prv, cur) => prv + cur.getLeafChildrenCount(), 0);
        }
        this.root.leafCount = count;
        return count;
    }

    getSelectedLeafChildrenCount() {
        let count;
        if (this.isLeaf()) {
            count = this.isFullSelect() ? 1 : 0;
        } else {
            count = this.getChildren()
                .reduce((prv, cur) => prv + cur.getSelectedLeafChildrenCount(), 0);
        }
        return count;
    }

    setInitialState(selectedIds, cascade = true) {
        const result = [];
        if (Array.isArray(selectedIds) && selectedIds.length > 0) {
            selectedIds = selectedIds.map(item => this._stringId(item));
            if (selectedIds.indexOf(this.getStringId()) >= 0) {
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
    }

    update(cascade = true) {
        if (this.isLeaf()) {
            this.isSelected = 1 - this.isSelected;
        } else {
            this.isSelected = this.selectStatus(cascade) < 1 ? 1 : 0;
            cascade && this.getChildren()
                .forEach(treeNode => treeNode._fromUpNotification(this.isSelected));
        }
        cascade && this.getParent() && this.getParent()._fromDownNotification();
        this._onStatusChange();
    }

    search(text, keys, multiselect, exactly = false, canSearch = true) {
        if (!exactly) {
            text = text.toLowerCase();
        }
        const result = [];
        if (canSearch) {
            const uniqueKeys = Array.from(new Set(keys));
            const isContain = uniqueKeys
                .some(key => this.root.info[key] && this.root.info[key].toLowerCase().indexOf(text) >= 0);
            if (isContain) {
                result.push(this);
            }
        }
        if (!this.isLeaf()) {
            this.getChildren()
                .forEach(child => {
                    const chresult = child.search(text, keys, multiselect, exactly);
                    chresult.forEach(item => result.push(item));
                });
        }
        return result;
    }

    hasAncestor(ancestor) {
        const parent = this.getParent();
        if (parent) {
            return ancestor.getStringId() === parent.getStringId()
                || parent.hasAncestor(ancestor);
        } else {
            return false;
        }
    }

    findById(childId) {
        if (this.getStringId() === this._stringId(childId)) {
            return [this];
        } else if (this.isLeaf()) {
            return undefined;
        } else {
            return this.getChildren()
                .reduce((prv, cur) => {
                    const r = cur.findById(childId);
                    if (r) {
                        if (!prv) {
                            prv = [];
                        }
                        prv.push(r);
                    }
                    return prv;
                }, undefined);
        }
    }

    _fromUpNotification(status) {
        this.isSelected = status;
        if (!this.isLeaf()) {
            this.getChildren().forEach(treeNode => treeNode._fromUpNotification(status));
        }
        this._onStatusChange();
    }

    _fromDownNotification() {
        this._onStatusChange();
        this.getParent() && this.getParent()._fromDownNotification();
    }

    _onStatusChange() {
        this.onStatusChange && this.onStatusChange(this);
    }

    _stringId(id) {
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
    }
};

export default Tree;
