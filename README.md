# react-native-general-tree

[中文说明](README-zh_CN.md)

A general tree support tree operation.

## Install

Install by Yarn:

```shell
yarn add react-native-general-tree
```

Install by NPM:

```shell
npm install --save react-native-general-tree
```

## Usage

Import the module in file:

```javascript
import Tree from 'react-native-general-tree';
```

### Construct

You can convert a javascript object to a tree. It will use several key to identify id and children.

Constructor declaration is:

```javascript
constructor(
    root,
    parent = undefined,
    childrenKey = 'children',
    idKey = 'id',
    onStatusChange = undefined
)
```

* root: Object to be converted.
* parent: A `Tree` object to be parent node.
* childrenKey: `root[childrenKey]` will be used to generate children `Tree` node. `root[childrenKey] === undefined` means it is a leaf node.
* idKey: `root[idKey]` is an identifier of node, and will be used when `setInitialState`. It will be converted to a string when used in `Tree` class.
* onStatusChange: When one `Tree` node's select status change, it will be called with current node.

Example:

```javascript
const node = {
    code: 1,
    label: 'Hello',
    childs: [
        {code: 2, label: 'aaa', childs: []}, // not a leaf
        {code: 3, label: 'bbb'}, // a leaf
    ]
};
const tree = new Tree(node, null, 'childs', 'code', null, ['label'], ['label']);
```

### Select Status

A tree node have a select status.

```javascript
export const SelectType = {
    NotSelect: 0,
    IncompleteSelect: 0.5,
    FullSelect: 1,
};
```

A leaf node only have two status: not select or full select.

A not leaf node have all three status. `IncompleteSelect` means its children is not all selected.

The select status will be initialized in `constructor` with `NotSelect`. And you can use `setInitialState` to set a initial select state of a tree.

Then you can call `update` method to change a tree node select status automatically.

### Interface

* `isLeaf: () => boolean`
* `isEqual: (treeNode: Tree) => boolean`
* `selectStatus: (cascade: boolean) => 0 | 0.5 | 1`
* `isFullSelect: (cascade: boolean) => boolean`
* `isNotSelect: (cascade: boolean) => boolean`
* `isIncompleteSelect: (cascade: boolean) => boolean`
* `getLeafCount: () => number`
* `getSelectedLeafCount: () => number`
* `getDeepth: () => number`
* `getInfo: () => object`
* `getId: () => any`
* `getStringId: () => string`
* `getParent: () => Tree?`
* `getChildren: () => Tree[]?`
* `getLeafChildren: () => Tree[]`
* `setInitialState: (selectedIds: any[], cascade: boolean) => Tree[]`
* `update: (cascade: boolean) => void`
* `search: (text: string, keys: string[], multiselect: boolean, exactly: boolean, canSearch: boolean) => Tree[]`
* `hasAncestor: (ancestor: Tree) => boolean`
* `findById: (childId: any) => Tree[]`

## Reference

Please see this repository: [react-native-items](https://github.com/gaoxiaosong/react-native-items).