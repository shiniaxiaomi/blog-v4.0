// 日期工具类
Date.prototype.Format = function (fmt) { // author: meizz
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};
// 生成uuid
function uuid() {
    let temp_url = URL.createObjectURL(new Blob());
    let uuid = temp_url.toString(); // blob:https://xxx.com/b250d159-e1b6-4a87-9002-885d90033be3
    URL.revokeObjectURL(temp_url);
    return uuid.substr(uuid.lastIndexOf("/") + 1);
}

function updateFolderConfig() {
    $.post("/catalog/status/folder",$("#configFolderForm").serialize()+"&id="+getSelectedFolderId(),function (data,status) {
        if(status==="success" && data.code){
            layer.msg("保存成功");
            $("#configFolderModal").modal("hide");
        }
    })
}

function openFolderStatusModel() {
    // 加载状态
    loadFolderStatus();

    // 显示弹框
    $('#configFolderModal').modal("show");
}

function loadFolderStatus() {
    // 清空选中
    $("#f_radio1").prop('checked', false);
    $("#f_radio2").prop('checked', false);

    // 根据catalogId请求对应folder的共享信息
    $.get("/catalog/status/folder/"+getSelectedFolderId(),function (data,status) {
        if(status==="success" && data.code) {
            // 设置私有选中
            if(data.data){
                $("#f_radio2").prop('checked', true);
            }else{ //设置公有选中
                $("#f_radio1").prop('checked', true);
            }
        }
    })
}

// 搜索的样式使用
function getFontCss(treeId, treeNode) {
    return  (!!treeNode.highlight) ? {color:"#A60000", "font-weight":"bold"} : {color:"#333", "font-weight":"normal"};
}
function hideBtn(treeNode) {
    let $createFolderBtn = $("#createFolderBtn");
    let $createNodeBtn = $("#createNodeBtn");
    let $editNodeBtn = $("#editNodeBtn");
    let $deleteNodeBtn = $("#deleteNodeBtn");
    let $updateFolderStatusBtn = $("#updateFolderStatusBtn");

    $createFolderBtn.show();
    $createNodeBtn.show();
    $editNodeBtn.show();
    $deleteNodeBtn.show();
    $updateFolderStatusBtn.show();

    if(treeNode.name==="/" || treeNode.name==="_待整理"){
        $editNodeBtn.hide();
        $deleteNodeBtn.hide();
        $updateFolderStatusBtn.hide();
    }else if(!treeNode.isFolder){ //如果是文件
        $createFolderBtn.hide();
        $createNodeBtn.hide();
        $updateFolderStatusBtn.hide();
    }
}
function beforeClick(treeId, treeNode, clickFlag) {
    // 控制每个节点的按钮权限
    hideBtn(treeNode);

    // 首次加载
    if(zTree.getSelectedNodes().length===0){
        loadMD(treeNode);
    }
    // 改变了选择节点
    else if(treeNode.id!==zTree.getSelectedNodes()[0].id){
        if(isEdit){
            updateBlog(); //保存
        }
        loadMD(treeNode); //加载
    }

    return true;
}
// 修改名称保存之前
function beforeRename(treeId, treeNode, newName, isCancel) {
    // 没有修改
    if(treeNode.name===newName){
        return true;
    }
    let response =$.ajax({
        type: "POST",//方法类型
        url: "/catalog/updateName" ,//url
        async:false,
        data: {id:treeNode.id,name:newName,isFolder:treeNode.isFolder,blogId:treeNode.blogId},
    });
    if(response.status===200 && response.responseJSON.code){
        layer.msg("更新成功");
        setTimeout(function () {
            zTree.cancelEditName(newName);
        },100);
        return true;
    }else{
        layer.msg("更新失败");
        setTimeout(function () {
            zTree.cancelEditName();
        },100);
        return false;
    }
}
// 加载对应id的blog内容到编辑器
function loadMD(treeNode) {
    // 在编辑器上显示对应的blog内容
    // 如果点击的是文件夹，则将右侧编辑器设置为不编辑
    if(treeNode.isFolder){
        window.vditor.setValue("文件夹不能进行编辑",false);
        window.vditor.disabled();
    }
    // 如果点击的是文件，则在右侧编辑器中显示文件内容
    else{
        console.log("加载内容");
        window.blogId=treeNode.blogId;
        window.vditor.enable();
        $.get("/blog/md?id="+treeNode.blogId,function (data,status) {
            if(status==="success" && data.code){
                window.vditor.setValue(data.data, false);
            }
        })
    }
}
// 拖入事件之前（只有文件夹才能拖入子节点）
function beforeDrop(treeId, treeNodes, targetNode, moveType) {
    // 如果是文件夹
    if(targetNode && targetNode.isFolder !== undefined && targetNode.isFolder===true){
        console.log(treeId, treeNodes, targetNode)

        if (window.confirm("确定要移动该文件吗？")) {
            let response =$.ajax({
                type: "POST",//方法类型
                url: "/catalog/move" ,//url
                async:false,
                data: {id:treeNodes[0].id,pid:targetNode.id},
            });
            if(response.status===200 && response.responseJSON.code){
                layer.msg("移动成功");
                return true;
            }else{
                layer.msg("移动失败");
            }
        }
    }else{
        layer.msg("不能拖入到文件中");
    }
    return false;
}


// 添加待整理的文件
function quickNewFile() {
    // 添加文件（默认添加以日期+时间为名称的文件）
    let name=new Date().Format("yyyy-MM-dd hh:mm:ss");
    let pNode = zTree.getNodesByParam("name", "_待整理", null)[0];
    let item={name: name,pid:pNode.id,isFolder:false,icon:"/ztree/img/file.png",checked:true};//这里的pid是待整理的文件夹的pid
    $.post("/catalog/insert",item,function (data,status) {
        if(status==="success" && data.code){
            item.blogId=data.data.blogId; //添加返回的blogId值
            item.id=data.data.id; //添加返回的目录itemId值

            let newNode = item;
            zTree.addNodes(pNode, newNode);// 默认添加到待整理文件夹
            // 筛选刚添加的节点
            console.log(newNode.id);
            let node = zTree.getNodesByParam("id", newNode.id, null)[0];
            // 设置选中节点
            zTree.selectNode(node);
            // 加载当前选中节点的md
            loadMD(node);
            // 默认重命名节点
            editTreeNode();
        }else{
            layer.msg("接口调用失败");
        }
    })
}

// 添加file或文件夹
function addNode(type) { //[file,folder]
    // hideRMenu();

    // 添加文件（默认添加以日期+时间为名称的文件）
    let name=new Date().Format("yyyy-MM-dd hh:mm:ss");
    let item={name: name,pid:zTree.getSelectedNodes()[0].id};
    if(type==="file"){
        item.isFolder=false;
        item.icon="/ztree/img/file.png";
    }else if(type==="folder"){
        item.isFolder=true;
        item.icon="/ztree/img/folder.png";
    }
    $.post("/catalog/insert",item,function (data,status) {
        if(status==="success" && data.code){
            item.blogId=data.data.blogId; //添加返回的blogId值
            item.id=data.data.id; //添加返回的目录itemId值
            let newNode = item;
            // 如果有选中节点
            if (zTree.getSelectedNodes()[0]) {
                newNode.checked = zTree.getSelectedNodes()[0].checked;
                zTree.addNodes(zTree.getSelectedNodes()[0], newNode);
            } else {
                zTree.addNodes(null, newNode);// 默认添加
            }

            // 筛选刚添加的节点
            console.log(newNode.id)
            let node = zTree.getNodesByParam("id", newNode.id, null)[0];
            // 设置选中节点
            zTree.selectNode(node);
            // 加载当前选中节点的md
            loadMD(node);
            // 默认重命名节点
            editTreeNode();
        }else{
            layer.msg("接口调用失败");
        }
    })
}

// 询问框工具方法
function layerConfirm(msg,func) {
    let index = layer.confirm(msg, {
        btn: ['确定','取消'] //按钮
    }, function(){
        func();
        layer.close(index); //如果设定了yes回调，需进行手工关闭
    }, function(){
        layer.close(index); //如果设定了yes回调，需进行手工关闭
    });
}

// 删除节点
function removeTreeNode() {
    // hideRMenu();
    let nodes = zTree.getSelectedNodes();
    if (nodes && nodes.length>0) {
        if (nodes[0].children && nodes[0].children.length > 0) {
            layer.msg("文件夹下还有文件，不能删除");
            return;
        } else {
            layerConfirm("确定删除该文件吗？",function () {
                $.post("/catalog/delete",{id:nodes[0].id,isFolder:nodes[0].isFolder,blogId:nodes[0].blogId},function (data,status) {
                    if(status==="success" && data.code){
                        zTree.removeNode(nodes[0]);
                        window.vditor.setValue("", true);//清空编辑器数据
                        window.vditor.disabled();//	禁用编辑器
                        layer.msg("删除成功")
                    }else{
                        layer.msg("删除失败");
                    }
                })
            })
        }
    }
}
// 编辑节点
function editTreeNode() {
    // hideRMenu();
    let node = zTree.getSelectedNodes()[0];
    layerConfirm("确定编辑名称吗？",function () {
        zTree.editName(node);
    })
}

// 过滤搜索节点
function filterSearch() {
    let $searchInput = $("#searchInput");
    let value=$searchInput.val().toLocaleLowerCase();
    if (value === "") return;
    nodeList = zTree.getNodesByParamFuzzy("name", value);

    let $treeDemo = $("#treeDemo li a");

    // 隐藏所有节点
    let filter = $treeDemo.filter((index,item)=>{
        $(item).parent().hide();
        return $(item).text().toLocaleLowerCase().indexOf(value)!==-1;
    });

    // 显示匹配节点
    $("#treeDemo .level0").eq(0).show();
    for(let i=0;i<filter.length;i++){
        $(filter[i]).parent().show();
    }
}

// 取消过滤
function cancelFilter() {
    let $treeDemo = $("#treeDemo li a");
    $treeDemo.filter((index,item)=>{
        $(item).parent().show();
        return false;
    });
}

// 高亮搜索节点
function highlightSearch() {
    let $searchInput = $("#searchInput");
    let value=$searchInput.val();
    updateNodes(false,nodeList);
    if (value === "") return;
    nodeList = zTree.getNodesByParamFuzzy("name", value);
    updateNodes(true,nodeList);
    // 清空搜索内容
    $searchInput.val('');
}
function updateNodes(highlight,nodeList){
    for( let i=0, l=nodeList.length; i<l; i++ ) {
        nodeList[i].highlight = highlight;
        nodeList[i].hiddenNodes = false;
        zTree.updateNode(nodeList[i]);
    }
}

let zTree, rMenu, zNodes,nodeList=[];
let setting = {
    edit:{
        enable: true,
        editNameSelectAll:true,
        showRemoveBtn: false,
        showRenameBtn: false,
        // 拖动规则
        drag:{
            isCopy:false,
            isMove : true,
            prev:false,
            inner:true,
            next:false
        }
    },
    view: {
        dblClickExpand: true,
        fontCss:getFontCss
    },
    data: {
        simpleData: {
            enable: true,
            idKey: "id",
            pIdKey: "pid",
            rootPId: null
        }
    },
    callback: {
        // onRightClick: OnRightClick,
        beforeDrop: beforeDrop,
        beforeClick:beforeClick,//点击之前，如果点击了不是已经选中的节点，则自动保存右侧对应的内容
        beforeRename:beforeRename
    }
};
// 加载目录数据
function initTree(isLogin){
    // 权限校验
    if(isLogin===false){
        setting = {
            edit:{
                enable: false,
            },
            view: {
                dblClickExpand: true,
                fontCss:getFontCss
            },
            data: {
                simpleData: {
                    enable: true,
                    idKey: "id",
                    pIdKey: "pid",
                    rootPId: null
                }
            },
            callback: {
                beforeClick:function (treeId, treeNode, clickFlag) {
                    if(treeNode.blogId===null){
                        return;
                    }
                    window.location="/blog/"+treeNode.blogId;
                }
            }
        };
    }

    // 绑定搜索输入框的回车事件
    $("#searchInput").keypress(function(e) {
        if (e.keyCode === 13) {
            highlightSearch();
        }
    });

    // 加载目录数据
    $.get("/catalog",function (data,status) {
        // 指定icon图标并保存目录节点
        zNodes = data.data.map(item=>{
            if(item.isFolder!==undefined && item.isFolder===true){
                item.icon="/ztree/img/folder.png";
                item.open=true;
            }else{
                item.icon="/ztree/img/file.png";
            }
            return item;
        });
        // 初始化树（加载数据和配置）
        $.fn.zTree.init($("#treeDemo"), setting, zNodes);
        zTree = $.fn.zTree.getZTreeObj("treeDemo");
        rMenu = $("#rMenu");
    });
}

// 返回选中的blogId
function getSelectedBlogId() {
    // 判断选中的不是文件夹或者是否没有选择
    if(zTree.getSelectedNodes()===undefined || zTree.getSelectedNodes()[0]===undefined || zTree.getSelectedNodes()[0].isFolder){
        layer.msg('请选择对应的blog');
        throw new Error( '请选择对应的blog' );
    }
    return zTree.getSelectedNodes()[0].blogId;
}

// 返回选中的文件夹对应的catalogId
function getSelectedFolderId() {
    // 判断选中的不是文件夹或者是否没有选择
    if(zTree.getSelectedNodes()===undefined || zTree.getSelectedNodes()[0]===undefined || !zTree.getSelectedNodes()[0].isFolder){
        layer.msg('请选择对应的文件夹');
        throw new Error( '请选择对应的文件夹' );
    }
    return zTree.getSelectedNodes()[0].id;
}