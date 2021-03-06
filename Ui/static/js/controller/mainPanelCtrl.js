/**
 * Created with JetBrains PhpStorm.
 * User: zoujiawei
 * Date: 13-12-26
 * Time: 下午11:38
 * To change this template use File | Settings | File Templates.
 */

define(['lodash', 'angular', 'lib/common'], function(_, angular, common) {
    /**
     * 新增环境controller
     * @type {Array}
     */
    var addSiteController = ['$scope', '$modalInstance', 'module', 'site', '$rootScope', 'notify',
        function($scope, $modal, module, site, $rootScope, notify) {
            // @link https://github.com/angular/angular.js/wiki/Understanding-Scopes#javascript-prototypal-inheritance
            $scope.info = {
                siteName: '',
                description: '',
                modules: null
            };

            // 表单
            $scope.mainForm = null;
            $scope.moduleForm = null;

            $scope.modulesValid = false;

            $scope.isAjax = false;

            module.readAll(function(res) {
                $scope.info.modules = res.data;
            });

            $scope.ok = function() {
                common.validateForm($scope, $scope.mainForm);
                if ($scope.mainForm.$valid && !$scope.isAjax) {
                    $scope.isAjax = true;
                    var info = _.clone($scope.info, true);
                    info.modules = _.filter(info.modules, function(module) {
                        return module.checked;
                    });
                    site.addSite(info, function(res) {
                        $scope.isAjax = false;
                        if (res.errorCode === 200) {
                            $rootScope.$broadcast('add:site');
                            $modal.close();
                            notify.open({
                                template: res.data + '<br/>服务器将在3s后重启'
                            });
                        } else {
                            notify.open({
                                template: res.data,
                                type: 'error',
                                sticky: true
                            });
                        }
                    });
                }
            };
            $scope.cancel = function() {
                $modal.close();
            };

            $scope.$on('branchList:dirty', function(e, moduleId) {
                _.find($scope.info.modules, function(module, index) {
                    if (module.id === moduleId) {
                        $scope.info.modules[index].checked = true;
                        return true;
                    }
                    return false;
                });
            });

            $scope.$on('branchList:change', function(e, moduleId, value) {
                _.find($scope.info.modules, function(module, index) {
                    if (module.id === moduleId) {
                        $scope.info.modules[index].branch = value;
                        return true;
                    }
                    return false;
                });
            });

            $scope.$watch('info.modules', function (newValue) {
                if (newValue) {
                    var len = newValue.length;
                    _.find(newValue, function(module, index) {
                        if (module.checked) {
                            $scope.modulesValid = true;
                            return true;
                        } else if (index === len - 1) {
                            $scope.modulesValid = false;
                            return true;
                        }
                        return false;
                    });
                    // 由于modules全局共享，有些地方改变，可能此时moduleForm为null
                    $scope.moduleForm && $scope.moduleForm.$setValidity('required', $scope.modulesValid);
                }
            }, true);
        }
    ];

    /**
     * checkout代码controller
     * @type {Array}
     */
    var checkoutController = ['$scope', '$modalInstance', 'module', '$rootScope', 'notify', 'terminal',
        function($scope, $modal, module, $rootScope, notify, terminal) {
            $scope.info = {
                url: '',
                name: ''
            };
            $scope.form = null;
            $scope.namePlaceholder = '';

            $scope.modules = null;
            var modulesArr = [];
            module.readAll(function(res) {
                $scope.modules = res.data;
                angular.forEach(res.data, function(value) {
                    var nameArr = value.storename.split('/');
                    modulesArr.push(nameArr);
                });
            });

            $scope.ok = function() {
                common.validateForm($scope, $scope.form);
                if ($scope.form.$valid) {
                    var ter = terminal.open({
                        title: 'CheckOut'
                    });
                    $modal.close();
                    $scope.info.name = $scope.info.name || $scope.namePlaceholder;
                    module.checkout($scope.info, function(res) {
                        if (res.log) {
                            ter.write(res.data);
                        } else {
                            if (res.errorCode === 200) {
                                var data = res.data || {};
                                $rootScope.$broadcast('add:branch', data.id);
                                notify.open({
                                    template: '代码CheckOut完成',
                                    sticky: false,
                                    type: 'normal'
                                });
                            } else {
                                notify.open({
                                    template: res.data,
                                    type: 'error',
                                    sticky: true
                                });
                            }
                        }
                    });
                }
            };

            $scope.cancel = function() {
                $modal.close();
            };

            $scope.$watch('info.url', function(value) {
                if ($scope.form && $scope.form.url.$valid) {
                    value = value.match(/https?:\/\/(.*?)\/(.*)/);
                    if (value && value[2]) {
                        value = value[2].split('/');
                        var ret = arrayMatch(value, modulesArr);
                        if (ret.ratio === 1) {
                            $scope.namePlaceholder = ret.value.join('/');
                            return;
                        }
                    }
                }
                $scope.namePlaceholder = '';
            });

            function arrayMatch(oArray, matchArray) {
                var ret = {},
                    oObj = {};
                angular.forEach(oArray, function(value) {
                    oObj[value] = true;
                });
                angular.forEach(matchArray, function(value) {
                    var count = 0,
                        ratio;
                    angular.forEach(value, function(str) {
                        if (oObj[str]) {
                            count++;
                        }
                    });
                    ratio = count / value.length;
                    if (ratio > 0 && (!ret.value || (ratio > ret.ratio) || (ratio === ret.ratio && value.length > ret.value.length))) {
                        ret = {
                            value: value,
                            ratio: ratio
                        }
                    }
                });
                return ret;
            }
        }
    ];

    /**
     * 新增模块
     * @type {Array}
     */
    var moduleController = ['$scope', '$modalInstance', 'module', 'notify', '$rootScope',
        function($scope, $modal, module, notify, $rootScope) {
            $scope.info = {
                name: '',
                title: '',
                description: '',
                fe: true
            };

            $scope.form = null;

            $scope.modules = null;
//            getModules();
            module.readAll(function(res) {
                $scope.modules = res.data;
            });

            // title占位文字
            $scope.placeholder = '';
            $scope.$watch('info.name', function (newValue) {
                newValue = newValue ? newValue.split('/') : [];
                $scope.placeholder = newValue.pop();
            });


            $scope.ok = function() {
                common.validateForm($scope, $scope.form);
                if ($scope.form.$valid) {
                    if (!$scope.info.title) {
                        $scope.info.title = $scope.placeholder;
                    }
                    module.add($scope.info, function(res) {
                        if (res.errorCode === 200) {
                            $modal.close();
                            notify.open({
                                template: $scope.info.title + '模块新建成功！',
                                sticky: false,
                                type: 'normal'
                            });
                            $rootScope.$broadcast('module:change');
//                            getModules();
                        } else {
                            notify.open({
                                template: res.data,
                                type: 'error',
                                sticky: true
                            });
                        }
                    });
                }
            };

            $scope.delete = function(id) {
                module.delete({id: id}, function(res) {
                    if (res.errorCode === 200) {
                        deleteModule(id);
                        notify.open({
                            template: '删除成功'
                        });
                    } else {
                        notify.open({
                            template: '删除失败<br />' + res.data,
                            type: 'error',
                            sticky: true
                        });
                    }
                });
            };

            $scope.cancel = function() {
                $modal.close();
            };

//            function getModules() {
//                module.readAll(function(res) {
//                    $scope.modules = res.data;
//                });
//            }

            /**
             * 由于删除操作，涉及到后台异步通信，用index方式，可能会导致误删
             * @param id
             */
            function deleteModule(id) {
                var index = -1;
                _.find($scope.modules, function(value, idx) {
                    if (value.id === id) {
                        index = idx;
                        return true;
                    }
                    return false;
                });
                if (index > -1) {
                    $scope.modules.splice(index, 1);
                }
            }
        }
    ];

    // 用户名管理
    var userController = ['$scope', '$modalInstance', 'user', 'notify', function($scope, $modal, user, notify) {
        $scope.users = null;
        $scope.newUser = {
            name: '',
            email: ''
        };

        user.read(function(res) {
            $scope.users = res.data;
        });

        $scope.cancel = function() {
            $modal.close();
        };

        $scope.addUser = function(form, type) {
            if (form.$valid) {
                user.create({
                    name: $scope.newUser.name,
                    email: $scope.newUser.email,
                    type: type
                }, function(res) {
                    if (res.errorCode === 200) {
                        $scope.users[type].push(angular.copy($scope.newUser));
                        notify.open({
                            template: '添加成功'
                        });
                    } else {
                        notify.open({
                            template: '添加失败<br />' + res.data,
                            type: 'error',
                            sticky: true
                        });
                    }
                });
            }
        };

        $scope.delete = function(name, type) {
            user.delete({
                name: name,
                type: type
            }, function(res) {
                if (res.errorCode === 200) {
                    var index = -1;
                    _.find($scope.users[type], function(value, idx) {
                        if (value.name === name) {
                            index = idx;
                            return true;
                        }
                        return false;
                    });
                    if (index > -1) {
                        $scope.users[type].splice(index, 1);
                    }
                    notify.open({
                        template: '删除成功'
                    });
                } else {
                    notify.open({
                        template: '删除失败<br />' + res.data,
                        type: 'error',
                        sticky: true
                    });
                }
            });
        }
    }];

    return ['$scope', '$modal', function($scope, $modal) {
        $scope.addSite = function() {
            var modal = $modal.open({
                templateUrl: '/static/html/addSite.html',
                controller: addSiteController,
                backdrop: 'static',
                windowClass: 'add-site'
            });

//            modal.result.then(function() {
//            }, function() {
//            });
        };

        $scope.checkout = function() {
            var modal = $modal.open({
                templateUrl: '/static/html/checkout.html',
                controller: checkoutController,
                backdrop: 'static',
                windowClass: 'checkout'
            });
        };

        /**
         * 新增模块
         */
        $scope.addModule = function() {
            var modal = $modal.open({
                templateUrl: '/static/html/module.html',
                controller: moduleController,
                backdrop: 'static',
                windowClass: 'module-manager'
            });
        };

        $scope.user = function() {
            $modal.open({
                templateUrl: '/static/html/user.html',
                controller: userController,
                backdrop: 'static',
                windowClass: 'user-manager'
            });
        }
    }];
});