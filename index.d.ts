export type SelectValueType = 0 | 0.5 | 1;

export const SelectType: {
    NotSelect: SelectValueType,
    IncompleteSelect: SelectValueType,
    FullSelect: SelectValueType,
};

export type TreeKeyType = string | number | {};
export type TreeValueType = any;
export type SortFuncType = (a: any, b: any) => -1 | 0 | 1;

declare class Tree {
    constructor(
        root?: {},
        parent?: Tree,
        childrenKey?: TreeKeyType,
        idKey?: TreeKeyType,
        onStatusChange?: (treeNode: Tree) => void,
    );

    isLeaf: () => boolean;
    isEqual: (treeNode: Tree) => boolean;

    isFullSelect: (cascade?: boolean) => boolean;
    isNotSelect: (cascade?: boolean) => boolean;
    isIncompleteSelect: (cascade?: boolean) => boolean;
    selectStatus: (cascade?: boolean) => SelectValueType;

    getLeafCount: () => number;
    getSelectedLeafCount: () => number;
    getDeepth: () => number;
    getInfo: () => {};
    getId: () => TreeValueType;
    getStringId: () => string;
    getParent: () => Tree | void;
    getChildren: () => Tree[];
    getSplitChildren: (
        split?: (childs: Tree[], sort?: SortFuncType) => Array<Tree | Tree[]>,
        sort?: SortFuncType
    ) => Array<Tree | Tree[]>;
    getLeafChildren: () => Tree[];

    setInitialState: (selectedIds: TreeKeyType[], cascade?: boolean) => Tree[];
    update: (cascade?: boolean) => void;
    search: (
        text: string,
        keys: TreeKeyType[],
        multiselect: boolean,
        exactly?: boolean,
        canSearch?: boolean
    ) => Tree[];

    hasAncestor: (ancestor: Tree) => boolean;
    findById: (childId: TreeKeyType) => Tree[] | void;

    private _fromUpNotification: (status: boolean) => void;
    private _fromDownNotification: () => void;
    private _onStatusChange: () => void;
    private _stringId: (id: TreeKeyType) => string;
}

export default Tree;