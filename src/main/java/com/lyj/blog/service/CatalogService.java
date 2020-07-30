package com.lyj.blog.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.lyj.blog.mapper.CatalogMapper;
import com.lyj.blog.model.Blog;
import com.lyj.blog.model.Catalog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * @author Yingjie.Lu
 * @description
 * @date 2020/7/30 1:17 下午
 */
@Service
public class CatalogService {

    @Autowired
    CatalogMapper catalogMapper;

    @Autowired
    BlogService blogService;

    @Transactional
    public void insert(Catalog catalog){
        // 如果不是文件夹，则先添加blog，再添加目录item
        if(!catalog.getIsFolder()){
            Blog blog = new Blog().setName(catalog.getName());
            blogService.insert(blog);
            catalog.setBlogId(blog.getId()); //将blog的id回写
        }
        catalogMapper.insert(catalog);
    }

    public List<Catalog> selectCatalog() {
        List<Catalog> list = catalogMapper.selectList(new QueryWrapper<>());
        return list;
    }

    @Transactional
    public void delete(Catalog catalog) {
        // 如果是文件，则删除文件
        if(!catalog.getIsFolder()){
            blogService.delete(catalog.getBlogId());
        }

        // 删除目录item
        catalogMapper.deleteById(catalog.getId());
    }

    @Transactional
    public void updateName(Catalog catalog) {
        // 如果是文件，更改blogName
        if(!catalog.getIsFolder()){
            blogService.updateName(catalog.getBlogId(),catalog.getName());
        }

        // 更新目录itemName
        Catalog update = new Catalog().setId(catalog.getId()).setName(catalog.getName());
        catalogMapper.updateById(update);
    }

    public void updatePid(Catalog catalog) {
        catalogMapper.updateById(catalog);
    }
}
