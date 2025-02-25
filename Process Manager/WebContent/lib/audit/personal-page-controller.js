'use strict'

angular.module('querying').controller('personalPageController', ["$scope", "graphqlClientService", function ($scope, graphqlClientService) {

    $scope.user = null;

    $scope.showNotLoggedInMessage = false;

    $scope.isRetrievingData = false;

    $scope.selectedModel = null;


    $scope.initializeUser = async function () {
        if (graphqlClientService.isLoggedIn()) {
            $scope.isRetrievingData = true;
            const user = await graphqlClientService.getCurrentUser();
            await retreiveDataWithUser(user);
            const models = await graphqlClientService.getModels();
            updateBindings(models, user);
        } else {
            $scope.showNotLoggedInMessage = true;
        }
    }

    $scope.selectModel = function (model) {
        $scope.selectedModel = model;
    }


    async function retreiveDataWithUser(user) {
        if (!user || !user.instances)
            return;

        for (const instance of user.instances) {
            if (!instance.deployedContract || !instance.deployedContract.address || !instance.deployedContract.abi)
                continue;

            await graphqlClientService.getContractDataWithWeb3(instance.deployedContract);
        }
    }

    function updateBindings(models, user) {
        let userModels = models.filter(m => m.instances.find(i => user.instances.find(ii => ii.id === i.id)));
        userModels = userModels.sort((a, b) => a.name.localeCompare(b.name));

        for (const model of userModels) {
            model.totalInstances = model.instances.length;
            model.instances = model.instances.map(i => user.instances.find(ii => ii.id === i.id)).filter(i => i != null);
            model.completedInstances = model.instances.filter(i => i.deployedContract && i.deployedContract.isCompleted).length;
            model.completedInstancesPercentage = model.completedInstances * 100 / model.totalInstances;

            for (const instance of model.instances) {
                if (instance.deployedContract == null)
                    continue;

                if (instance.deployedContract.subscriptions) {
                    const indices = getAllIndexes(instance.deployedContract.subscriptions[1], user.address);
                    instance.userRoles = [];
                    for (const index of indices) {
                        if (instance.deployedContract.subscriptions[0].length <= index)
                            continue;
                        instance.userRoles.push(instance.deployedContract.subscriptions[0][index]);
                    }
                }

                if (instance.deployedContract.optionalSubscriptions) {
                    const indices = getAllIndexes(instance.deployedContract.optionalSubscriptions[1], user.address);
                    instance.userOptionalRoles = [];
                    for (const index of indices) {
                        if (instance.deployedContract.optionalSubscriptions[0].length <= index)
                            continue;
                        instance.userOptionalRoles.push(instance.deployedContract.optionalSubscriptions[0][index]);
                    }
                }

                if (!Array.isArray(instance.deployedContract.transactions)) {
                    instance.executionTime = 0;
                    instance.totalGasUsed = 0;
                    continue;
                }

                let totalGas = 0;
                let totalFee = 0;
                for (const transaction of instance.deployedContract.transactions) {
                    totalGas += parseInt(transaction.gasUsed);
                    totalFee += transaction.fee ? transaction.fee : 0;
                }

                instance.totalGasUsed = totalGas;
                instance.totalFee = totalFee;
                instance.executionTime = isNaN(instance.deployedContract.executionTime) ? 0 : instance.deployedContract.executionTime;
            }

            const allRoles = model.instances.map(i => Array.isArray(i.userRoles) ? i.userRoles : []);
            const allOptionalRoles = model.instances.map(i => Array.isArray(i.userOptionalRoles) ? i.userOptionalRoles : []);
            model.userRoles = [...new Set([].concat.apply([], allRoles))];
            model.userOptionalRoles = [...new Set([].concat.apply([], allOptionalRoles))];

            const completedInstances = model.instances.filter(x => x.deployedContract != null && x.deployedContract.isCompleted);
            if (Array.isArray(completedInstances) && completedInstances.length > 0) {
                model.maxExecutionTime = Math.max(...completedInstances.map(i => i.executionTime));
                model.minExecutionTime = Math.min(...completedInstances.map(i => i.executionTime));
                const totalExecutionTime = completedInstances.map(i => i.executionTime).reduce((a, b) => a + b, 0);
                model.avgExecutionTime = totalExecutionTime / completedInstances.length;
    
                model.maxGasUsed = Math.max(...completedInstances.map(i => i.totalGasUsed));
                model.minGasUsed = Math.min(...completedInstances.map(i => i.totalGasUsed));
                const total = completedInstances.map(i => i.totalGasUsed).reduce((a, b) => a + b, 0);
                model.avgGasUsed = total / completedInstances.length;
    
                model.maxFee = Math.max(...completedInstances.map(i => i.totalFee));
                model.minFee = Math.min(...completedInstances.map(i => i.totalFee));
                const totalFee = completedInstances.map(i => i.totalFee).reduce((a, b) => a + b, 0);
                model.averageFee = totalFee / completedInstances.length;
            }
        }
        
        $scope.$apply(() => {
            $scope.user = user;
            $scope.models = userModels;
            $scope.isRetrievingData = false;
        });
    }


    function getAllIndexes(arr, val) {
        try {
            var indexes = [], i = -1;
            while ((i = arr.indexOf(val, i + 1)) != -1) {
                indexes.push(i);
            }
            return indexes;
        }catch (e) {
            console.log(e);
        }finally{
            return indexes;
        }
    }

}]);
