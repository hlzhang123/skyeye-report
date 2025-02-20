/*******************************************************************************
 * Copyright 卫志强 QQ：598748873@qq.com Inc. All rights reserved. 开源地址：https://gitee.com/doc_wei01/skyeye-report
 ******************************************************************************/

package com.skyeye.service.impl;

import com.github.miemiedev.mybatis.paginator.domain.PageBounds;
import com.github.miemiedev.mybatis.paginator.domain.PageList;
import com.skyeye.common.object.InputObject;
import com.skyeye.common.object.OutputObject;
import com.skyeye.common.util.ToolUtil;
import com.skyeye.dao.ReportImportModelDao;
import com.skyeye.service.ReportImportModelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 *
 * @ClassName: ReportImportModelServiceImpl
 * @Description:
 * @author: skyeye云系列--卫志强
 * @date: 2021/5/16 23:21
 *
 * @Copyright: 2021 https://gitee.com/doc_wei01/skyeye-report Inc. All rights reserved.
 * 注意：本内容具体规则请参照readme执行，地址：https://gitee.com/doc_wei01/skyeye-report/blob/master/README.md
 */
@Service
public class ReportImportModelServiceImpl implements ReportImportModelService {

    @Autowired
    private ReportImportModelDao reportImportModelDao;

    /**
     * 获取文件模型关系表格信息
     *
     * @param inputObject
     * @param outputObject
     * @throws Exception
     */
    @Override
    public void getReportImportModelList(InputObject inputObject, OutputObject outputObject) throws Exception {
        Map<String, Object> map = inputObject.getParams();
        List<Map<String, Object>> beans = reportImportModelDao.getReportImportModelList(map,
                new PageBounds(Integer.parseInt(map.get("page").toString()), Integer.parseInt(map.get("limit").toString())));
        PageList<Map<String, Object>> beansPageList = (PageList<Map<String, Object>>)beans;
        int total = beansPageList.getPaginator().getTotalCount();
        outputObject.setBeans(beans);
        outputObject.settotal(total);
    }

    /**
     * 新增文件模型关系表格信息
     *
     * @param inputObject
     * @param outputObject
     * @throws Exception
     */
    @Override
    public void insertReportImportModel(InputObject inputObject, OutputObject outputObject) throws Exception {
        Map<String, Object> inputParams = inputObject.getParams();
        // 校验fileName, modelId是否重复
        if (duplicateNameCheck(inputParams, outputObject)) {
            return;
        }
        inputParams.put("id", ToolUtil.getSurFaceId());
        inputParams.put("createTime", ToolUtil.getTimeAndToString());
        inputParams.put("userId", inputObject.getLogParams().get("id"));
        reportImportModelDao.insertReportImportModel(inputParams);
    }

    /**
     * 根据id删除文件模型关系表格信息
     *
     * @param inputObject
     * @param outputObject
     * @throws Exception
     */
    @Override
    public void delReportImportModelById(InputObject inputObject, OutputObject outputObject) throws Exception {
        Map<String, Object> inputParams = inputObject.getParams();
        reportImportModelDao.delReportImportModelById(String.valueOf(inputParams.get("id")));
    }

    /**
     * 根据id更新文件模型关系表格中fileName, modelId信息
     *
     * @param inputObject
     * @param outputObject
     * @throws Exception
     */
    @Override
    public void updateReportImportModelById(InputObject inputObject, OutputObject outputObject) throws Exception {
        Map<String, Object> inputParams = inputObject.getParams();
        // 校验fileName, modelId是否重复e
        if (duplicateNameCheck(inputParams, outputObject)) {
            return;
        }
        inputParams.put("userId", String.valueOf(inputObject.getLogParams().get("id")));
        inputParams.put("createTime", ToolUtil.getTimeAndToString());
        reportImportModelDao.updateReportImportModelById(inputParams);
        outputObject.setBean(inputParams);
    }

    @Override
    public void getReportImportModelById(InputObject inputObject, OutputObject outputObject) throws Exception {
        Map<String, Object> inputParams = inputObject.getParams();
        Map<String, Object> bean = reportImportModelDao.getReportImportModelById(String.valueOf(inputParams.get("id")));
        outputObject.setBean(bean);
        outputObject.settotal(1);
    }

    /**
     * 对fileName、modelId进行重名校验
     *
     * @param inputParams
     * @param outputObject
     * @return true表示有重名, false反之
     */
    private boolean duplicateNameCheck(Map<String, Object> inputParams, OutputObject outputObject) throws Exception {
        // fileName, modelId不重复
        String fileName = inputParams.get("fileName").toString();
        String modelId = inputParams.get("modelId").toString();
        String id = inputParams.containsKey("id") ? inputParams.get("id").toString() : null;
        Integer totalNumber = reportImportModelDao.queryReportImportModelByFileName(fileName, id);
        if (totalNumber > 0) {
            outputObject.setreturnMessage("该fileName已存在");
            return true;
        }
        totalNumber = reportImportModelDao.queryReportImportModelByModelId(modelId, id);
        if (totalNumber > 0) {
            outputObject.setreturnMessage("该modelId已存在");
            return true;
        }
        return false;
    }
}
