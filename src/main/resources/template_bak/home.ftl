<!doctype html>
<html lang="en">
<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="/static/css/bootstrap.min.css">

    <#include "ftlTemplate/SEOTemplate.ftl">
    <@title>首页</@title>
    <@keywords>首页</@keywords>
    <@description></@description>

    <#--blog-->
    <link rel="stylesheet" href="/static/css/blog.css">

</head>
<body>

<#--引入顶部导航栏-->
<#include "ftlTemplate/navTemplate.ftl">
<@header/>

<#--主体-->
<div class="container-xl">
    <div class="row">

        <#--左侧-->
        <div class="col-lg-9">
            <#include "ftlTemplate/blogListTemplate.ftl">

            <#--置顶博客-->
            <div class="whiteBlock">
                <@blogList blogs=stickBlogs tagColor="badge-danger">
                    <p class="text-muted" style="font-size: 20px;">置顶</p>
                </@blogList>
            </div>

            <#--最新博客-->
            <div class="whiteBlock">
                <@blogList blogs=blogs tagColor="badge-warning">
                    <p class="text-muted d-inline" style="font-size: 20px;">最新博客</p>
                    <a class="text-muted" style="float: right" href="/moreBlog?page=1">更多</a>
                </@blogList>

                <hr>
                <div style="text-align: right;margin-top:10px">
                    <a class="text-muted" style="margin-right: 30px" href="/moreBlog?page=1">更多</a>
                </div>
            </div>
        </div>

        <#--右侧-->
        <div class="col-lg-3 d-none d-lg-block" >
            <div class="sticky-top">
                <#--介绍信息-->
                <#include "ftlTemplate/introduceTemplate.ftl" >
                <@introduce/>
            </div>
        </div>

    </div>

    <#--备案号-->
    <div style="text-align: center;margin: 10px;">
        <a href="http://www.beian.miit.gov.cn" style="color: rgb(118, 118, 118); text-decoration: none;">
            ICP证 : 浙ICP备18021271号
        </a>
    </div>
</div>

<!-- Optional JavaScript -->
<!-- jQuery first, then Popper.js, then Bootstrap JS -->
<script src="/static/js/jquery.min.js"></script>
<script src="/static/js/popper.min.js"></script>
<script src="/static/js/bootstrap.min.js"></script>
<!-- 弹窗 -->
<script src="/static/js/pop.js"></script>

<#--引入登入模板(该模板需要刚在jquery加载之后的body标签内)-->
<#include  "ftlTemplate/loginTemplate.ftl">

<script>
    $(function () {
        //开启提示工具
        $('[data-toggle="tooltip"]').tooltip();

        // $("#keywordInput").focus();

    })

    //删除blog或者localDraft
    function deleteFunc(type,id){
        if(type=="blog"){
            pop.confirm("是否要删除",function () {
                $.post("/deleteBlog?blogId="+id,function (data, status) {
                    pop.prompt("删除成功");
                    if(data.code==200){
                        setTimeout(function () {
                            window.location.reload();//刷新页面
                        },1000)
                    }
                })
            })
        }
    }
</script>


</body>
</html>