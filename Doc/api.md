# API

## 网络API

m3d提供了一套restful api，用于外部交互，m3d的控制面板全部通过api进行交互渲染。

例如：[`http://music.m3d.javey.me/project/info?method=get`](http://music.m3d.javey.me/project/info?method=get)

由于有些开发机不支持`put`，`delete`等http method，所以采用了加入参数`method`来区分请求类型，所有`method !== 'get'`的请求都用 `post` method

目录`Lib/Action`下的文件为请求入口文件，每个`Action.class.php`对应一类请求，`/project/info`对应`ProjectAction.class.php`，并执行`info`方法

1. ### 获取工程信息

    Note: 取自工程配置文件`project/music/conf/config.php`

    Method: `GET`

    API: [`http://music.m3d.javey.me/project/info`](http://music.m3d.javey.me/project/info)

    Response:
    ```javascript
    {
        errorCode: 200,
        data: {
            host: "music.baidu.com", // 对应测试环境的地址，将会用改地址加上环境名称前缀，如:youhua.music.baidu.com
            name: "音乐主站"
        }
    }
    ```

1. ### 获取所有测试环境名称

    Method: `GET`

    API: [`http://music.m3d.javey.me/site/name`](http://music.m3d.javey.me/site/name)

    Response:
    ```javascript
    {
        errorCode: 200,
        data: [
            "youhua",
            "huaihuai",
            "vip",
            "mpc"
        ]
    }
    ```

1. ### 获取测试环境详细信息

    Method: `GET`

    API: [`http://music.m3d.javey.me/site/info?name=javey`](http://music.m3d.javey.me/site/info?name=javey)

    Response:
    ```javascript
    {
        errorCode: 200,
        data: {
            id: 17,
            name: "javey",
            author: "M3D",
            createTime: "2014/04/18",
            description: "javey",
            modules: [
                // 模块列表，只返回该测试环境需要的模块
                {
                    id: 3, // 模块id
                    title: "web",
                    filename: "web",
                    storename: "app/search/music/rd/web",
                    description: "主站RD模块",
                    fe: 0, // 是否是fe模块，用于判断是否展示“合图”，“编译”，“提测”按钮，'0'表示不显示
                    branch: "music_1-0-208_new_index_BRANCH"
                },
                {
                    id: 4,
                    title: "main",
                    filename: "main",
                    storename: "app/search/music/fe/main",
                    description: "主站FE模块",
                    fe: 1,
                    branch: "music_1-0-8-4_BRANCH"
                },
                {
                    id: 5,
                    title: "mobile",
                    filename: "mobile",
                    storename: "app/search/music/fe/mobile",
                    description: "webapp",
                    fe: 1,
                    branch: "trunk"
                }
            ]
        }
    }
    ```

1. ### 改变测试环境信息

    Note: 可以将上述api获取的信息，做相应的改变后，进行保存。能改变的字段有:`description`, `modules -> branch`，其它字段如果改变将会忽略或报错

    Method: `POST`

    API: [`http://music.m3d.javey.me/site/info?method=put`](http://music.m3d.javey.me/site/info?method=put)

    Post Data(Form Data)：
    ```javascript
    id:17
    name:javey
    author:M3D
    createTime:2014/04/18
    description:javey // 可以改变描述信息
    modules[0][id]:3
    modules[0][title]:web
    modules[0][filename]:web
    modules[0][storename]:app/search/music/rd/web
    modules[0][description]:主站RD模块
    modules[0][fe]:0
    modules[0][branch]:music_1-0-176_tieba_BRANCH // 改变指向的svn分支，参考：获取一个模块下所有的svn分支的接口
    modules[1][id]:4
    modules[1][title]:main
    modules[1][filename]:main
    modules[1][storename]:app/search/music/fe/main
    modules[1][description]:主站FE模块
    modules[1][fe]:1
    modules[1][branch]:music_1-0-8-4_BRANCH
    modules[1][$$hashKey]:017
    modules[2][id]:5
    modules[2][title]:mobile
    modules[2][filename]:mobile
    modules[2][storename]:app/search/music/fe/mobile
    modules[2][description]:webapp
    modules[2][fe]:1
    modules[2][branch]:trunk
    ```

    Response:
    ```javascript
    {"errorCode":200,"data":""}
    ```

1. ### 获取一个模块下所有的svn分支

    Method: `GET`

    API: [`http://music.m3d.javey.me/module/branches?id=3`](http://music.m3d.javey.me/module/branches?id=3)

    Response:
    ```javascript
    {
        errorCode: 200,
        data: [
            "VIP_qudao_BRANCH",
            "music_1-0-116_ipadrouter_BRANCH",
            "music_1-0-176_dianquan_BRANCH",
            "music_1-0-176_kingb_BRANCH",
            "trunk"
        ]
    }
    ```

1. ### 获取所有模块

    Method: `GET`

    API: [`http://music.m3d.javey.me/module`](http://music.m3d.javey.me/module)

    Response:
    ```javascript
    {
        errorCode: 200,
        data: [
            {
                id: 3,
                title: "web",
                filename: "web",
                storename: "app/search/music/rd/web",
                description: "主站RD模块",
                fe: 0
            },
            {
                id: 4,
                title: "main",
                filename: "main",
                storename: "app/search/music/fe/main",
                description: "主站FE模块",
                fe: 1
            },
            {
                id: 5,
                title: "mobile",
                filename: "mobile",
                storename: "app/search/music/fe/mobile",
                description: "webapp",
                fe: 1
            },
            {
                id: 6,
                title: "ipad-mig",
                filename: "ipad-mig",
                storename: "app/search/music/fe/ipad-mig",
                description: "ipad-webapp",
                fe: 1
            }
        ]
    }
    ```

1. ### 新增环境

    Method: `POST`

    API: `http://music.m3d.javey.me/site/name?method=post`

    Post Data(Form Data):
    ```javascript
    siteName:javey
    description:test
    modules[0][id]:3
    modules[0][title]:web
    modules[0][filename]:web
    modules[0][storename]:app/search/music/rd/web
    modules[0][description]:主站RD模块
    modules[0][fe]:0
    modules[0][branch]:trunk
    modules[1][id]:4
    modules[1][title]:main
    modules[1][filename]:main
    modules[1][storename]:app/search/music/fe/main
    modules[1][description]:主站FE模块
    modules[1][fe]:1
    modules[1][branch]:trunk
    ```

    Response:
    ```javascript
    {"errorCode":200,"data":""}
    ```

1. ### 删除环境

    Method: `POST`

    API: `http://music.m3d.javey.me/site/name?method=delete`

    Post Data(Form Data):
    ```javascript
    name:javey
    ```

    Response:
    ```javascript
    {"errorCode":200,"data":""}
    ````

1. ### 刷新环境

    Note: 刷新环境，相当于删除后重建，由于环境的软链配置并没有存入db，而是根据文件实际软链路径确定的，所以需要提供详细的重建环境数据（Post Data）。该功能可用来更新环境lighttpd配置（当template_site模板分支配置改变时，同步过去），还可以用来清除smarty缓存。

    Method: `POST`

    API: `http://music.m3d.javey.me/site/name?method=put`

    Post Data(Form Data):
    ```javascript
    id:58
    name:doc
    author:M3D
    createTime:2014/11/11
    description:test
    modules[0][id]:3
    modules[0][title]:web
    modules[0][filename]:web
    modules[0][storename]:app/search/music/rd/web
    modules[0][description]:主站RD模块
    modules[0][fe]:0
    modules[0][branch]:trunk
    modules[1][id]:4
    modules[1][title]:main
    modules[1][filename]:main
    modules[1][storename]:app/search/music/fe/main
    modules[1][description]:主站FE模块
    modules[1][fe]:1
    modules[1][branch]:trunk
    ```

1. ### 添加模块

    Method: `POST`

    API: `http://music.m3d.javey.me/module?method=put`

    Post Data(Form Data):
    ```javascript
    name:app/search/music/fe/webapp-lebo // 对应[scm](http://scm.baidu.com/index/index.action)平台中的模块路径
    title:webapp-lebo
    description:乐播webapp
    fe:true // 是否是fe模块，用于决定是否显示“编译”等按钮
    ```

    Response:
    ```javascript
    {"errorCode":200,"data":""}
    ```

1. ### 删除模块

    Method: `POST`

    API: `http://music.m3d.javey.me/module?method=delete`

    Post Data(Form Data):
    ```javascript
    id:7 // 要删除的模块id
    ```

    Response:
    ```javascript
    {"errorCode":200,"data":""}
    ```

1. ### CheckOut代码到开发机

    Note: m3d不会自动与svn服务器进行同步代码，所有在svn中新建的分支必须co到开发机才能使用，一般新增模块后需要co trunk到开发机

    Method: `POST`

    API: `http://music.m3d.javey.me/module/branches?method=post`

    Post Data(Form Data):
    ```javascript
    url:https://svn.baidu.com/app/search/music/trunk/fe/webapp-lebo/ // svn地址
    name:app/search/music/fe/webapp-lebo // 对应的模块路径，相应scm平台模板路径
    ```

    Response:

    输出是文本流，用于terminal中展示命令执行的详细信息

1. ### 添加用户名

    Note: 用户名管理，仅用于提测收发邮件

    Method: `POST`

    API: `http://music.m3d.javey.me/user?method=post`

    Post Data(Form Data):
    ```javascript
    name:邹家伟
    email:邹家伟@baidu.com
    type:to // to代表收件人，一般为QA，from代表发件人，一般为FE
    ```

    Response:
    ```javascript
    {"errorCode":200,"data":""}
    ```

1. ### 删除用户名

    Method: `POST`

    API: `http://music.m3d.javey.me/user?method=delete`

    Post Data(Form Data):
    ```javascript
    name:邹家伟
    type:to
    ```

    Response:
    ```javascript
    {"errorCode":200,"data":""}
    ```

1. ### 合图

    Method: `GET`

    API: [`http://music.m3d.javey.me/imerge/auto?site=youhua&module=main`](http://music.m3d.javey.me/imerge/auto?site=youhua&module=main)

    Description: `site`为环境名称，`module`为模块名称

    Response:

    输出是文本流，用于terminal中展示命令执行的详细信息

2. ### 编译

    Method: `GET`

    API: [`http://music.m3d.javey.me/process?site=youhua&module=main&isIncre=true`](http://music.m3d.javey.me/process?site=youhua&module=main&isIncre=true)

    Description: `site`为环境名称，`module`为模块名称，`isIncre = true || false`，是否进行增量编译

    Response:

    输出是文本流，用于terminal中展示命令执行的详细信息

1. ### 提测

    Method: `POST`

    API: `http://music.m3d.javey.me/module/test?method=post`

    Post Data(Form Data):
    ```javascript
    to:zoujiawei@baidu.com,
    from:zoujiawei@baidu.com,
    // 模块信息，一般需要提供rd模块和fe模块
    modules[rd][id]:3
    modules[rd][title]:web
    modules[rd][filename]:web
    modules[rd][storename]:app/search/music/rd/web
    modules[rd][description]:主站RD模块
    modules[rd][branch]:trunk
    modules[fe][id]:4
    modules[fe][title]:main
    modules[fe][filename]:main
    modules[fe][storename]:app/search/music/fe/main
    modules[fe][description]:主站FE模块
    modules[fe][branch]:trunk
    subject:test // 主题
    description:test // 描述信息
    ```
    Response:
    ```javascript
    {"errorCode":200,"data":""}
    ```

## 系统API

### 全局函数

1. #### require_cache

    require_once优化版

    * __param__: `$filename {String}` 文件路径
    * __return__: `{Boolean}`

    ```php
    require_cache('path/to/php.php');
    ```

2. #### require_array

    批量导入文件

    * __param__: `$files {Array}` 文件路径数组
    * __return__: `{Boolean}`

    ```php
    require_array(array(
        'path/to/php1.php',
        'path/to/php2.php'
    ));
    ```

3. #### halt

    打印错误信息，并结束程序

    * __param__: `$error {Exception|String}` 错误信息
    * __return__: `{Null}`

    ```php
    halt('文件不存在');
    ```

4. #### C

    设置或获取配置信息，`key`忽略大小写。设置同一个key的值，会覆盖前面设置的值。

    * __param__: `$name {String|Array|Null}` 如果为`String`，将作为key进行查找或设置；如果为`Array`则进行批量设置
    * __param__: `$value {Mixed|Null}` 需要设置的值
    * __return__: `{Mixed}` 返回查找的值

    ```php
    // 返回全部值
    C();
    // 返回某个key的值
    C('KEY');
    // 返回二维数组的值
    C('KEY1.KEY2');

    // 设置
    C('KEY', 'value');
    C('KEY1.KEY2', 'value');
    C(array(
        'KEY1' => 'value1',
        'KEY2' => 'value2'
    ));
    ```

5. #### mark

    打印日志到前端的terminal

    * __param__: `$msg {String}` 要打印的信息
    * __param__: `$type {String}` 信息类型，用于决定前端显示的样式，可选值为：`normal/emphasize/error/warn`
    * __return__: `{Null}`

    ```php
    // 打印一条表示强调的信息
    mark('这行文本颜色为绿色', 'emphasize');
    ```

6. #### shell_exec_ensure

    执行shell命令，并打印所有shell命令的输出到terminal

    * __param__: `$shell {String}` shell命令
    * __param__: `$showInfo {Boolean} Default: true` 是否打印标准输出到terminal
    * __param__: `$showError {Boolean} Default: true` 是否打印错误输出到terminal
    * __param__: `{Array} array('output' => array(), 'status' => 0)` 返回命令执行的所有输出和错误码数组

    ```php
    // 执行ls命令，并打印结果到termial，并获取ls执行输出进一步处理
    $info = shell_exec_ensure('ls');
    var_dump($info); // $info = array('output' => array('dir', 'file'), 'status' => 0)
    ```

7. #### shell_exec_stdio

    从标准输入中获取内容，作为shell的输入，执行命令

    * __param__: `$exec {String}` shell命令
    * __param__: `$content {String}` 输入的内容
    * __return__: `{String}` 命令执行后的输出，若失败则输出原始输入的内容

    ```php
    // 输入coffee文本内容，并输入到shell，解析成js
    $content = file_get_contents('a.coffee');
    $content = shell_exec_stdio('coffee -bsp', $content);
    ```

8. #### show_json

    打印json数据

    * __param__: `$msg {Mixed}` 数据
    * __param__: `$errorCode {Number} Default: 200` 错误码
    * __return__: `{Null}`

    ```php
    show_json(array(
        'key1' => 'value1',
        'key2' => 'value2
    ));
    // ouput
    // {
    //     "errorCode": 200,
    //     "data": {
    //         "key1": "value1",
    //         "key2": "value2"
    //     }
    // }

9. #### show_error

    打印json格式的错误信息

    * __param__: `$msg {Mixed}` 错误数据
    * __param__: `$die {Boolean} Default: false` 是否打印信息后，结束程序
    * __param__: `$errorCode {Number} Defulat: 500` 错误码
    * __return_: `{Null}`

    ```php
    // 打印信息，并提前结束程序
    show_error('出现严重未知错误', true);
    ```

10. #### on

    绑定事件

    * __param__: `$event {String|Array}` 事件名或事件名数组
    * __param__: `$class {String}` 执行某个类的`run`方法，或者执行某个类的静态方法（如果$class包含作用域符`::`)
    * __param__: `$priority {Number} Default: 9999` 优先级，数值越小，优先级越高

    Note: 关于每个`$class`值指定方法传入的参数，参见`trigger`函数

    ```php
    class TestPlugin extends Plugin {
        public function run($params) {
            // $params将是trigger方法传入的所有参数数组
            var_dump($params);
        }
        public static function end($params) {
            var_dump($params);
        }
    }
    // 绑定编译开始的时候执行某个命令
    on('process_start', 'Test') // 如果是类名，则不需要写上'Plugin'后缀，但是静态方法则需要写上全名
    // 绑定编译结束后执行某个命令
    on('process_end', 'TestPlugin::end');
    ```

11. #### off

    解绑事件。

    通常一个插件都会绑定多个事件，第一个事件一般会加入控制检查，当满足某个条件时才会执行后续事件，这时可以在第一个事件到达时，
    进行判断，如果条件不成立，则解绑所有后续事件，而不是在每个事件中加入条件判断。

    * __param__: `$event {String|Array}` 事件名称或数组，同`on`方法
    * __param__: `$class {String}` 要解绑的方法，同`on`方法
    * __return__: `{Null}`

    ```php
    // 解绑process_start的Test插件
    off('process_start', 'Test');
    ```

12. #### trigger

    派发某个事件

    * __param__: 可变长参数，可以传入任意长度和类型的值，第一个为事件名`$event`，这些参数将会已数组的形式，传入`on`绑定的方法中
    * __return__: {Boolean}

    ```php
    class Test {
        public static function hello($params) {
            echo 'Event: ' . $params[0] . ', Data: '. $params[1];
        }
    }
    on('my_event', 'Test::hello');
    trigger('my_event', 'hello'); // ouput: Event: my_event, Data: hello
    ```

13. #### comma_str_to_array

    将逗号`,`分割的字符串，转化为数组

    * __param__: `$str {String}`
    * __return__: `{Array}`

    ```php
    $ret = comma_str_to_array('a, b, c');
    // $ret = array('a', 'b', 'c');
    ```

14. #### get_files_by_type

    递归扫描某（几）个目录，得到指定文件类型的文件

    * __param__: `$paths {String|Array}` 路径， `,`分割的字符串或数组
    * __param__: `$types {String|Array}` 文件类型，`,`分割的字符串或数组
    * __prams__: `$root {String}` 如果`$paths`为相对路径，那指定相对的根目录

    ```php
    // 得到所有的js和coffee文件
    $ret = get_files_by_type('path/to/static', 'js, coffee');
    ```

15. #### file_uid

    根据传入的内容，返回简化的md5值

    * __param__: `$content {String}` 文件内容
    * __param__: `$type {String} Default: ''` 文件类型
    * __return__: `{String}` 简化的md5值

    ```php
    $content = file_get_contents('a.js');
    $id = file_uid($content, 'js');
    ```

16. #### contents_to_file

    优化的`file_put_contents`，可以确保目录存在。`file_put_contents`写入到不存在的目录会报错

    * __param__: `$path {String}` 写入路径
    * __param__: `$contents {String}` 写入内容
    * __return__: `{Boolean}`

    ```php
    // 无需担心`a/b/c/d`目录是否存在，不存在会自动创建
    contents_to_file('a/b/c/d/e.js', 'hello world');
    ```

17. #### rm_dir

    由于php删除文件夹需要递归，非常麻烦，所以封装了一下，采用shell命令来删，而且即使要删除的文件夹不存在也不会报错

    * __param__: `$path {String}` 删除路径
    * __return__: `{Boolean}`

    ```php
    // 若`a/b/c`存在则删除，否则什么也不做
    rm_dir('a/b/c');
    ```

18. #### str_remove_add

    给字符串去掉前面的一部分，然后在前面新增一部分，如果要去掉的那部分在字符串中不存在，则不会去掉，但是照样会新增，所以不同于内置的替换函数`str_replace`

    * __param__: `$str {String}` 原始字符串
    * __param__: `$remove {String}` 删除的字符串
    * __param__: `$add {String}` 新增的字符串
    * __return__: `{String}` 修改后的字符串

    ```php
    $ret = str_remove_add('/static/js/a.js', '/static', '/st'); // $ret = '/st/js/a.js'
    ```

19. #### str_random

    生成指定长度的随机字符串

    * __param__: `$length {Number} Default: 5` 随机字符窜长度
    * __return__: `{String}` 返回的随机字符串

    ```php
    $ret = str_random(); // bc1YU
    ```

20. #### get_type_by_content

    根据文件内容判断文件类型

    判断方式，依次为`finfo` -> `mime_content_type` -> `file -nbi`

    * __param__: `$content {String}` 文本内容
    * __return__: {String} 文件类型

    ```php
    // 判断图片格式
    $content = file_get_contents('a.png');
    $ret = get_type_by_content($content); // $ret = 'image/png'
    ```

21. #### array_to_string

    将一个数组格式化成字符换，不同于序列化，因为当`require`这个文件时，可以返回原始数据，它保存的是php代码

    * __param__: `$array {Array}` 要写入的数组
    * __return__: `{String}`

    ```php
    $array = array('key' => 'value');
    $ret = array_to_string($array);
    // output
    // <?php
    // return array(
    //     "key" => "value"
    // );
    ```

22. #### Tool::restartServer

    重启服务器



