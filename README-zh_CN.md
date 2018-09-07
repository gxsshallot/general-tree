# react-native-general-tree

一个通用的树形结构类, 支持树的内部基本操作.

## 安装

使用Yarn安装:

```shell
yarn add react-native-general-tree
```

使用NPM安装:

```shell
npm install --save react-native-general-tree
```

## 使用

在文件中导入模块:

```javascript
import Tree from 'react-native-general-tree';
```

### 构造

可以将一个Javascript对象转换成一个树. 将使用部分键作为标识ID和子节点列表.

构造器声明如下:

```javascript
constructor(
    root,
    parent = undefined,
    childrenKey = 'children',
    idKey = 'id',
    onStatusChange = undefined,
    normalPinyinKeys = [],
    firstLetterPinyinKeys = []
)
```

* root: 将被转换的Javascript对象.
* parent: 一个`Tree`类型对象作为当前节点的父节点.
* childrenKey: 使用`root[childrenKey]`来产生子节点列表. `root[childrenKey] === undefined`表示这是一个叶节点.
* idKey: `root[idKey]`是一个节点的标识, 将被用于`setInitialState`. 当在`Tree`类内部使用时, 它将被转换成一个字符串.
* onStatusChange: 当一个`Tree`节点的选择状态改变时, 它将会被调用并传入当前节点作为参数.
* normalPinyinKeys: 一个键名字数组, 将产生常规拼音并被用于搜索.
* firstLetterPinyinKeys: 一个键名字数组, 将产生首字母拼音并被用于搜索.

示例:

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

### 选择状态

每一个`Tree`节点都有一个选择状态.

```javascript
export const SelectType = {
    NotSelect: 0,
    IncompleteSelect: 0.5,
    FullSelect: 1,
};
```

一个叶节点仅有两种状态: 未选中或已选中.

一个非叶节点有三种状态. `IncompleteSelect`表示它的子节点并未被全部选中.

选择状态将在`constructor`中初始化为`NotSelect`. 你可以使用`setInitialState`来设置一颗树的初始选择状态.

然后可以调用`update`方法来自动改变一个节点的选择状态.

### 接口

* `isLeaf: () => boolean`
* `selectStatus: (cascade: boolean) => 0 | 0.5 | 1`
* `isFullSelect: (cascade: boolean) => boolean`
* `isNotSelect: (cascade: boolean) => boolean`
* `isIncompleteSelect: (cascade: boolean) => boolean`
* `getLeafCount: () => number`
* `getSelectedLeafCount: () => number`
* `getDeepth: () => number`
* `getInfo: () => object`
* `getId: () => any`
* `getParent: () => Tree?`
* `getChildren: () => Tree[]?`
* `getPinyin: (key: string) => string?`
* `getFirstLetterPinyin: (key: string) => string?`
* `getSplitChildren: (sort: function, splic: function) => Tree[][]`
* `getLeafChildren: () => Tree[]`
* `setInitialState: (selectedIds: any[], cascade: boolean) => Tree[]`
* `update: (cascade: boolean) => void`
* `search: (text: string, keys: string[], multiselect: boolean, exactly: boolean, canSearch: boolean) => Tree[]`
* `hasAncestor: (ancestor: Tree) => boolean`
* `findById: (childId: any) => Tree[]`

## 参考

请参照这个仓库的说明: [react-native-items](https://github.com/gaoxiaosong/react-native-items/blob/master/README-zh_CN.md).