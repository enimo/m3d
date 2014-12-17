# Tutorial

## M3D核心

M3D的核心代码在`Lib`目录下。作为编译工具，主要实现合图和编译功能，而且实现的比较纯粹，所有附加的功能，如svn操作，增量编译等，都以插件的形式提供。

* ### 目录结构及说明

    * `Lib/Action` 每个请求对应的处理文件入口，例如：`/module/branches`将对应到`ModuleAction.class.php`中的`branches`方法
    * `Lib/Core` 整个M3D框架的核心，实现简单的MVC，及插件机制等功能
    * `Lib/Model` 数据交互层
    * `Lib/Third` 第三方库
    * `Lib/Tool` 工具库，提供了合图和编译工具
        * `Lib/Tool/Instantmerge` 合图工具
        * `Lib/Tool/Preprocess` 编译工具
    * `Plugin` 插件存放目录
    * `Common` 通用文件夹，工具函数
    * `Conf` 默认配置文件夹
    * `Ui` 前端控制面板
    * `Install` 安装m3d相关文件

* ### 命名规范

    所有文件名如果是类文件，则以`class.php`结尾，文件名必须与类名相同，且采用驼峰命名法，并且类名需要标明该类的含义，
    例如：Action必须以`Action`为后缀作为类名

    文件夹名采用与文件名保持一致的策略，特别对于插件`Plugin`，文件夹名为文件名去掉`Plugin.class.php`的名称

    这样命名是为了方便php自动加载对应的文件

* ### 合图

    * #### 功能

        分析所有css文件的`background`属性，得到一份合图配置，将配置输入合图算法，生成一张大图，然后将大图和生成后的配置写入文件

    * #### 结构

        * `Instantmerge/InstantmergeTool.class.php` 合图工具入口
        * `Instantmerge/MergeConfig` 这下面几个文件与合图配置生成和写入有关
        * `Instantmerge/MergeImage` 根据配置生成所需要的大图sprite
        * `Instantmerge/config.php` 合图默认配置

* ### 编译

    * #### 功能

        1. md5化所有静态资源
        2. 替换css图片为合成的大图
        3. 加入cdn
        4. 压缩静态资源
        5. 合并文件

    * #### 结构

        * `Preprocess/PreprocessTool.class.php` 编译工具入口
        * `Preprocess/Common` 通用文件
        * `Preprocess/Compressor` 文件压缩器
        * `Preprocess/Css` css处理器，替换小图为大图，并压缩
        * `Preprocess/Html` html处理器，可以处理smarty，主要替换html中引用的静态资源路径为md5后的路径，并加入cdn
        * `Preprocess/Js` js处理器，替换js使用的静态资源路径为md5后的路径，替换指定的替换文本，并压缩
        * `Preprocess/Media` image处理器，md5化图片路径，并可选打开压缩功能
        * `Preprocess/Other` other处理器，仅仅做文件移动到编译后的目录中，不做其他处理

## m3d.php

每个项目的svn源码中，在根目录下都存在一个`m3d.php`文件，这个文件是m3d合图和编译的配置文件，由于它可能被修改，为了更方便merge代码，故一般都放在src目录下，
然后通过`require`的形式加载过来。不管真实的配置文件放在哪里，至少根目录下要存在该文件。

这个配置信息的例子：http://music.m3d.javey.me/admin/m3d

在解释这个文件内容之前，我们先回顾下编译部分。

M3D提供了5个预处理器，分别为：`media`（处理图片），`css`（处理css）， `js`（处理js），`html`（处理模板），`other`（处理其他类型）。详细功能见`编译`

1. 由于大部分处理都需要替换路径，但是并非所有的路径都可以被替换，例如：路径是通过变量合成的，所以对于这类路径我们需要设计出`白名单 white_list`。
白名单文件__内容__会被处理，但__路径__保持不变，即不md5化
2. 在js中可能还会用到一些使用线下地址的情况，上线时会替换成线上，所以设计了`替换列表 replace_list`
3. 还有些救急措施，例如：m3d默认会将大图压缩成png8，或者某个js或css本身没有问题，但由于m3d的bug导致解析报错等等。这种情况我们可以让这些文件__内容__不被处理，
但是可以md5化__路径__

* ### 内容说明

    * #### process

        预处理器配置，为上面提到的5中预处理器的组合，但是有先后顺序。包含关系类似这样

        ```js
        media --------> css
          |   \        / |
          |      \  /    |
          |     /   \    |
          V  V        V  V
         js  ---------> html
        ```

        所以编译顺序应为`media` -> `css` -> `js` -> `html`，至于`other`放哪都行

        参数说明：

        1. `from`: 表示从哪里进行文件扫描
        2. `to`: 处理后写到哪里去，若省略则表示，保持原始路径不变
        3. `type`: 扫描的文件类型
        4. `processor`: 预处理器类型
        5. `name`: 每类处理器完成后，都会生成一个编译前后对应路径的map，对于这个文件的命名，可以通过name制定，默认为processor名
        6. `subfile`: 这个参数比较特殊，这也是全配置的一个弊端，有时为了满足一个功能，就必须不停地加参数。它的作用是：
        即使在设置了`to`参数后，是否依然保持原始路径不变。例如：扫描到文件`/static/image/a.png`，并且`to = /st/i`，如果`subfile = true`则放入
        `/st/i/static/image/a.png`，否则放入`/st/i/a.png`

        ** Note：每个处理器并非只能定义一次 **

        ** Note：如果编译后发现有文件丢失，则应该检查process中是否定义了处理该类文件，一般为：是否扫描了该目录下的文件`from`，是否处理了该类型文件`type` **

    * #### white_list

        白名单数组，需要在js中替换的文本

    * #### black_list

        不进行预处理，但是会改变路径、加上cdn的文件列表。默认sprite会压缩，如果有一张图不需要压缩，可以写上`bg_9527.png`，则不会压缩`bg`这张大图

    * #### white_list

        会进行预处理，但是不会改变路径的文件列表

    * #### cdn_list

        cdn域名列表，会根据一定的算法在路径前加入特定的cdn前缀，并非每次随机加入

    * #### config

        包括合图、编译及插件的各种配置信息，具体说明可以看示例文件

    * #### static_case

        这也是配置最蛋疼的地方，各种路径变换也是所有预处理中最蛋疼的地方

        1. `static_in_src`: 静态文件在源码目录中是怎么放的
        2. `static_in_file`: 静态文件在源码文件中是怎么引用

        举个例子就行了，会自动算出来各种前缀
