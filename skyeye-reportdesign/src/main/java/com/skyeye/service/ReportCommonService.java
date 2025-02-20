/*******************************************************************************
 * Copyright 卫志强 QQ：598748873@qq.com Inc. All rights reserved. 开源地址：https://gitee.com/doc_wei01/skyeye
 ******************************************************************************/

package com.skyeye.service;

import com.skyeye.common.object.InputObject;
import com.skyeye.common.object.OutputObject;

import java.util.Map;
import java.util.Set;

/**
 * @ClassName: ReportCommonService
 * @Description:
 * @author: skyeye云系列--卫志强
 * @date: 2021/5/17 21:31
 * @Copyright: 2021 https://gitee.com/doc_wei01/skyeye Inc. All rights reserved.
 * 注意：本内容仅限购买后使用.禁止私自外泄以及用于其他的商业目的
 */
public interface ReportCommonService {

    void testConnection(InputObject inputObject, OutputObject outputObject) throws Exception;

    /**
     * 连接数据源
     *
     * @param driverClass 数据源驱动类
     * @param url 数据源连接字符串
     * @param user 用户名
     * @param password 密码
     * @param outputObject 接口出参，如果没有可以填null
     * @return
     * @throws Exception
     */
    boolean connectionDataBase(final String driverClass, final String url, final String user,
                                      final String password, OutputObject outputObject) throws Exception;

    /**
     * 解析Xml格式文本
     *
     * @param inputObject
     * @param outputObject
     * @throws Exception
     */
    void parseXmlText(InputObject inputObject, OutputObject outputObject) throws Exception;

    /**
     * 解析Json格式文本
     *
     * @param inputObject
     * @param outputObject
     * @throws Exception
     */
    void parseJsonText(InputObject inputObject, OutputObject outputObject) throws Exception;

    /**
     * 获取数据源类型
     *
     * @param inputObject
     * @param outputObject
     * @throws Exception
     */
    void queryDataBaseMationList(InputObject inputObject, OutputObject outputObject) throws Exception;

    /**
     * 获取连接池类型
     *
     * @param inputObject
     * @param outputObject
     * @throws Exception
     */
    void queryPoolMationList(InputObject inputObject, OutputObject outputObject) throws Exception;

    /**
     * 解析SQL数据源
     *
     * @param inputObject
     * @param outputObject
     * @throws Exception
     */
    void parseSQLText(InputObject inputObject, OutputObject outputObject) throws Exception;

    /**
     * 解析Rest接口
     *
     * @param inputObject
     * @param outputObject
     */
    void parseRestText(InputObject inputObject, OutputObject outputObject);

    /**
     * 获取数据源类型列表
     *
     * @param inputObject
     * @param outputObject
     * @throws Exception
     */
    void queryDataFromTypeMationList(InputObject inputObject, OutputObject outputObject) throws Exception;

    void parseJsonSubNode(Map<String, Object> paramMap, Set<String> sets, boolean isFirstTime, String name);
}
