<?php
/**
 * Created by PhpStorm.
 * User: zoujiawei
 * Date: 13-11-1
 * Time: 下午4:21
 */

class PreprocessException extends Exception {}

abstract class Preprocess {
    protected $map = array(); // 编译前后文件映射表
    // 原始文件内容
    protected $oContents;
    // 处理后的文件内容
    protected $contents;
    protected $type;
    protected $path;
    protected $filename;
    protected $relativePath;

    private static $_instance = array();

    final public static function getInstance($class, $options=null) {
        if (empty($class)) {
            return null;
        }
        $class = ucfirst(strtolower($class)).'Preprocess';
        if (!isset(self::$_instance[$class])) {
            self::$_instance[$class] = empty($options) ? new $class() : new $class($options);
        }

        return self::$_instance[$class];
    }

    public function __construct($map = array()) {
        $this->map = $map;
    }

    /**
     * 处理
     * @return mixed
     */
    abstract public function process();

    /**
     * 压缩
     * @return mixed
     */
    abstract public function compress();

    /**
     * 扫尾工作
     * 之所以不用析构函数，是因为有些动作是在所有该类型资源处理完成时执行的
     * Css和Js处理，可能会初始化多个processor
     */
    public function end() {}

    /**
     * 生成文件md5 unique id
     * @return string
     */
    public function fileUid() {
        return file_uid($this->contents, $this->type);
    }

    /**
     * 设置一个将要处理的文件路径
     * @param $file 文件路径
     */
    public function setFile($file) {
        if (file_exists($file)) {
            $info = pathinfo($file);
            $this->type = $info['extension'];
            $this->filename = $info['basename'];
            $this->oContents = file_get_contents($file);
            $this->path = $file;
            $this->relativePath = str_replace(C('SRC.SRC_PATH'), '', $file);
        } else {
            halt($file.'不存在');
        }
    }

    public function setContents($contents) {
        $this->oContents = $contents;
    }

    public function getContents() {
        return $this->contents;
    }
    public function getPath() {
        return $this->path;
    }
    public function getRelativePath() {
        return $this->relativePath;
    }
    public function getType() {
        return $this->type;
    }
    public function getFilename() {
        return $this->filename;
    }

    /**
     * 是否是黑名单文件
     * @return bool
     */
    protected function isBlackFile() {
        $list = C('BLACK_LIST');
        return !is_null($list) ?
            (in_array($this->relativePath, $list) ?
                true : ((in_array($this->filename, $list)) ?
                    true : false)) : false;
    }
}