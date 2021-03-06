<?php
/**
 * vhost环境操作接口
 * User: zoujiawei
 * Date: 13-12-9
 * Time: 下午1:14
 */

class SiteAction extends Action {
    public function name() {
        switch ($this->method) {
            case 'get':
                $this->getSiteList();
                break;
            case 'post':
                $this->addSite();
                break;
            case 'delete':
                $this->deleteSite();
                break;
            case 'put':
                $this->refreshSite();
                break;
        }
    }

    public function info() {
        switch ($this->method) {
            case 'get':
                $this->getInfo();
                break;
            case 'put':
                $this->saveInfo();
                break;
        }
    }

    /**
     * 获取所有测试环境
     */
    private function getSiteList() {
        $model = new SiteModel();
        $names = $model->getSites();
        show_json($names);
    }

    /**
     * 添加测试环境
     */
    private function addSite() {
        $data = array(
            'siteName' => $_POST['siteName'],
            'description' => $_POST['description'],
            'author' => isset($_POST['author']) ? $_POST['author'] : 'M3D',
            'modules' => $_POST['modules']
        );

        $model = new SiteModel();
        if ($model->addSite($data)) {
            show_json('新建环境成功！', 200);
        } else {
            show_error('新建环境失败!');
        }

        // 添加环境后，重启服务器
        Tool::restartServer();
    }

    /**
     * 删除测试环境
     */
    private function deleteSite() {
        $name = $_POST['name'];
        $model = new SiteModel();
        $model->deleteSite($name);

        show_json('', 200);
        Tool::restartServer();
    }

    /**
     * 更新环境
     */
    private function refreshSite() {
        $data = array(
            'siteName' => $_POST['name'],
            'modules' => $_POST['modules']
        );
        $model = new SiteModel();
        if ($model->refreshSite($data)) {
            show_json();
            Tool::restartServer();
        } else {
            show_error('重建环境失败！');
        }
    }

    /**
     * 获取环境信息
     */
    private function getInfo() {
        $name = $_GET['name'];
        $model = new SiteModel();
        $info = $model->getSiteInfo($name);
        if (!empty($info)) {
            show_json($info);
        } else {
            show_error("${name}环境不存在");
        }
    }

    /**
     * 保存环境信息
     */
    private function saveInfo() {
        $data = array(
            'id' => (int)$_POST['id'],
            'description' => $_POST['description'],
            'modules' => $_POST['modules']
        );
        $model = new SiteModel();
        if ($model->updateSite($data)) {
            show_json();
        } else {
            show_error('保存出错！');
        }
    }
}