package com.lyj.blog.bak.controller;


import com.lyj.blog.bak.exception.MessageException;
import com.lyj.blog.bak.model.Message;
import com.lyj.blog.bak.service.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class DeleteController {

    @Autowired
    BlogService blogService;


    //根据blogId删除对应的blog
    @RequestMapping("deleteBlog")
    @ResponseBody
    public Message deleteBlog(Integer blogId) throws MessageException {
        blogService.deleteBlogById(blogId);
        return Message.success("删除成功");
    }


}