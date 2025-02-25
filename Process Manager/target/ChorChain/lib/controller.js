'use strict'


var module = angular.module('homePage.controllers', ['ngCookies']);
module.controller("controller", [ "$scope","$window", "$location", "service", '$cookies',
		function($scope,$window, $location,service, $cookies) {
			$scope.instance = {};
			$scope.model = {};
			$scope.martsiaInstance = {};
			$scope.isLogged = false;
			$scope.chorsiaRoles = {};
	        $scope.countPayment = 0;
			$scope.regUser = {};
			$scope.user = {};
			$scope.role = null;
			$scope.content = {};
			$scope.models = {};
			$scope.instances = {};
			$scope.present = false;
			$scope.msg = null;
			$scope.contracts = {};
			$location.path();
			$scope.cookieId = null;
			//$scope.user.address = "";
			$scope.modelName = "";
			$scope.myContract = {};
			$scope.selectedRoles = [];
			$scope.task = {};
			$scope.redirect = " ";
			$scope.visibleAtFields = [
			        {}
			    ];
			$scope.parametersArray = [
		        {}
		    ];
			$scope.forms = [
			        {}
			    ];

			$scope.forms2 = [
		        {}
		    ];

			//$scope.martsiaAbi = fs.fileRead();

			$scope.startExecuteMartsia = async function(model, instance){
				service.deploy(model, instance.id, $cookies.get('UserId')).then(async function (response) {
					sessionStorage.setItem('contract', JSON.stringify(response.data));
					//$scope.martsiaInstance
					await $scope.certification(model, instance);
					//$window.location.href = $scope.redirect + 'deploy.html';
				});
			}


			//2) /Certification/attributecertification
			$scope.certification = async function (){
				const model = $scope.model
				const instance = $scope.instance
				const result = await service.getParticipants(instance.id);
				//ritorna json con bike center: userId, customer: userId, etc...
				const participants = result.data;
				let roles = {};
				let authFinali = {}
				let authId = Math.floor(Math.random() * 3) + 1

				for(const role in participants) {
					const result2 = await service.setUser(participants[role]);
					roles[result2.data.address] = [role + "@AUTH" + authId];
					authFinali[role] = authId;
					authId++;
				}
				//console.log($scope.martsiaInstance.policy);
				let policy = {};

				for(const msg in $scope.martsiaInstance.policy){
					policy[msg] = "";
					for(let i = 0; i < $scope.martsiaInstance.policy[msg].length; i++){
						const reader = $scope.martsiaInstance.policy[msg][i];
						//const authId = Math.floor(Math.random() * 4) + 1
						//console.log(authId);
						policy[msg] += reader + "@AUTH" + authFinali[reader];
						if(i != ($scope.martsiaInstance.policy[msg].length - 1)){
							policy[msg] += ' OR ';
						}
					}
				}

				const input = {'roles': roles, 'process_id': instance.martsiaId, policy}
				//console.log(input);
				const resultCert = await service.certification(input);
				//console.log(resultCert);
				return resultCert;

			}


			$scope.submitform = function(){
				//console.log($scope.task);
				var paytop = document.getElementById('paymentCheckTop').checked;
				var messagetop = "";
				if(paytop == true){
					messagetop = "payment"+payCount+"()";
					payCount += 1;
				} else {
					if($scope.task.fnametop != "" && $scope.task.fnametop !=undefined){
						messagetop = $scope.task.fnametop+"(";
						for(var i in $scope.forms){
							messagetop += $scope.forms[i].type + " " + $scope.forms[i].vari;

							if(i != ($scope.forms.length-1)){
								messagetop += ", ";
							}
							else{
								messagetop += ")";
							}
						}
						//messagetop = mt+"("+typet+" "+vart+")";
						//console.log(messagetop);
					}
				}

				var paybottom = document.getElementById('paymentCheckBottom').checked;
				var messagebottom = "";
				if(paybottom == true){
					messagebottom = "payment"+payCount+"()";
					payCount += 1;
				} else {
					if($scope.task.fnamebot != "" && $scope.task.fnamebot != undefined){
						messagebottom = $scope.task.fnamebot+"(";
						for(var i in $scope.forms2){
							messagebottom += $scope.forms2[i].type + " " + $scope.forms2[i].vari;

							if(i != ($scope.forms2.length-1)){
								messagebottom += ", ";
							}
							else{
								messagebottom += ")";
							}
						}
					}
				}
				testingfunction(taskid, messagetop, $scope.task.parttop, $scope.task.tname, $scope.task.partbot, messagebottom);
				paytop = false;
				paybottom = false;
				document.getElementById('paymentCheckBottom').checked = false;
				document.getElementById('paymentCheckTop').checked = false;
				$scope.removeParameters();
				$scope.task.fnamebot = "";
				$scope.task.fnametop="";
			}


			$scope.addParameter = function() {
			       var newParam = {};
			       $scope.forms.push(newParam);
				}
			$scope.addParameter2 = function() {
			       var newParam2 = {};
			       $scope.forms2.push(newParam2);
				}
			$scope.removeParameters = function(){
				$scope.forms = [
			        {}
			    ];

			$scope.forms2 = [
		        {}
		    ];
			}
			 //add parameters modal + message
			$scope.addParam = function() {
			       var newUser = {};
			       $scope.parametersArray.push(newUser);
				}
				$scope.removeParam = function(addr) {
			       var index = $scope.parametersArray.indexOf(addr);
			       if(index>0){
				       $scope.parametersArray.splice(index,1);
			       }
				}

				$scope.closeModal = function() {
					$scope.parametersArray.splice(1,2);
					}

				$scope.addMessage = function(messageName,messageParam,paramType) {
					   if(messageParam == null & paramType == undefined)
						   {
						   	$scope.str = messageName;
						   	$('.djs-direct-editing-content').text($scope.str);
						   	$('.djs-direct-editing-content').focus();

						   }
					   else
						   {
						   $scope.str = messageName + "(" + paramType +" "+ messageParam + ")" ;
						   $('.djs-direct-editing-content').text($scope.str);
						   $('.djs-direct-editing-content').focus();

						   }
					   if($('#paymentCheck').is(':checked')) {
						$scope.countPayment++;
					   	$scope.str = "payment"+$scope.countPayment+"()";
					   	$('.djs-direct-editing-content').text($scope.str);
					   	$('.djs-direct-editing-content').focus();

					   }
					}

			 //add address modal
			$scope.addField = function() {
		       var newUser = {};
		       $scope.visibleAtFields.push(newUser);
			}
			$scope.removeField = function(addr) {
		       var index = $scope.visibleAtFields.indexOf(addr);
		       if(index>0){
			       $scope.visibleAtFields.splice(index,1);
		       }
			}
			// Toggle selection for the roles
			 $scope.toggleSelection = function toggleSelection(roleselected) {
			    var idx = $scope.selectedRoles.indexOf(roleselected);
			    // Is currently selected
			    if (idx > -1) {
			      $scope.selectedRoles.splice(idx, 1);
			    }
			    // Is newly selected
			    else {
			    	$scope.selectedRoles.push(roleselected);
			    }
			 }

			$scope.setModelName = function(fileName){
				$scope.modelName = fileName;
			}

			$scope.setModel = function(model){
				$scope.model = model;
			}

			$scope.registerUser = function(){
				service.registerUser($scope.regUser).then(function(response){
					alert(response.data);
				});
			}

			$scope.loginUser = function(){
					service.loginUser($scope.user).then(function (response) {
						if (!response.data) {

						} else {
							$cookies.put('UserId', response.data);
							$scope.cookieId = response.data;
							window.location.href = $scope.redirect + 'homePage.html';
						}

					});
			}


			$scope.getModels = function(){
			    $scope.cookieId = $cookies.get('UserId');
				service.getModels().then(function(response){
					$scope.models = response.data;
					//console.log("Models: ");
					//console.log($scope.models);
				});
			}

			//1) /Certification/generate_rsa_key_pair
			$scope.subscribe = async function (model, instance, roletosub, userAddress) {
				//console.log(instance);
				const input = {
					'actor': userAddress
				}

				const martsiaContract = new web3.eth.Contract($scope.martsiaAbi, "0xb4b1F31C51F70B1A76EE0e8d300ECbc75d0ceaa4");
				const userKeyPresent = await martsiaContract.methods["getPublicKeyReaders"]($scope.user.address).call({from: $scope.user.address})
				//TODO vedere cosa esce e fare if
				console.log(userKeyPresent);
				const response = await service.subscribe_generateRSA(input);
				console.log(response.data);
				//TODO vedere cosa esce e fare if
				if(response.data.keyPresent == true){
					console.log("hai già la chiave")
				}else {
					let martsiaContractInputs = [];
					martsiaContractInputs[0] = web3.utils.asciiToHex(response.data.data[0].replace("b'", "").replace("'", ""));
					martsiaContractInputs[1] = web3.utils.asciiToHex(response.data.data[1].replace("b'", "").replace("'", ""));
					const martsiaContractMethod = response.data.method;
					//console.log(response.data);
					//console.log(mfartsiaContractInputs[0]);
					//console.log(martsiaContractInputs[1]);
					await martsiaContract.methods["setPublicKeyReaders"](martsiaContractInputs[0], martsiaContractInputs[1]).send({
						from: $scope.user.address
					}).then(function (receipt) {
						//console.log(receipt);
					});
				}

				service.subscribe(instance.id, roletosub, $cookies.get('UserId')).then(function (response) {
					$scope.msg = response.data;
					service.getInstances(model).then(function (response) {
						//console.log(response);
						$scope.instances = response.data;
						$scope.present = true;
						$scope.getInstances(model);
					});
				});
			}


			$scope.getInstances = function(model){
				service.getInstances(model).then(function(response){
					$scope.model.instances = response.data;

					//console.log(response.data);
					$scope.present = true;
				});
			}

			 $scope.createInstance = function(model, visibleAt){
				 //console.log(visibleAt);
				 var visibleAtArray = [];
				 for(var i = 0; i< visibleAt.length; i++){
					 if(visibleAt[i].address){
						 visibleAtArray.push(visibleAt[i].address);
					 }
				 }
				 if(visibleAtArray[0] == undefined){
					 visibleAtArray[0] = "null";
				 }
				 var allRoles = angular.copy(model.roles);
				 if($scope.selectedRoles.length != 0){
					var allRoleslength = angular.copy(allRoles.length);
					for (var i= $scope.selectedRoles.length-1; i>=0; i--) {
						//remove the role selected from the all roles array
						var itemselected = allRoles.indexOf($scope.selectedRoles[i])
						allRoles.splice(itemselected, 1);
				    }
				 } else {
					 $scope.selectedRoles[0] = "null";
				 }
				service.createInstance(model, $cookies.get('UserId'), $scope.selectedRoles, allRoles, visibleAtArray).then(function(receipt){
					//console.log(receipt);
					$scope.selectedRoles = [];
					$scope.visibleAtFields = [
				        {}
				    ];
					$scope.msg = "Instance created";
					$scope.getInstances(model);
				});
			 }

			$scope.deploy = function(model, instanceId){
				service.deploy(model, instanceId, $cookies.get('UserId')).then(function(response){
					//console.log(response.data);
					sessionStorage.setItem('contract', JSON.stringify(response.data));
					//window.location.href = $scope.redirect + 'deploy.html';
				});
			}
			$scope.readPolicies = async function (model, instance) {


				const hashLinks = await $scope.certification();
				$scope.stateContract = new web3.eth.Contract($scope.stateAbi, "0xd266b9Cf9dF90128c6E180A543A09d0F67D49D42");
				console.log("martsiaId:", instance.martsiaId);
				console.log("roles:", $scope.martsiaInstance.roles);
				console.log("users:", $scope.martsiaInstance.users);
				console.log("elements:", $scope.martsiaInstance.elements);
				console.log("nextElements:", $scope.martsiaInstance.nextElements);
				console.log("previousElements:", $scope.martsiaInstance.previousElements);
				console.log("types:", $scope.martsiaInstance.types);
				console.log("hash1 (hex):", web3.utils.asciiToHex(hashLinks.data.hash1));
				console.log("hash2 (hex):", web3.utils.asciiToHex(hashLinks.data.hash2));

				console.log("creo transazione state contract")
                 const contractInstance = await $scope.stateContract.methods.instantiateProcess(
                     instance.martsiaId,
					 $scope.martsiaInstance.roles,
					 $scope.martsiaInstance.users,
					 $scope.martsiaInstance.elements,
					 $scope.martsiaInstance.nextElements,
					 $scope.martsiaInstance.previousElements,
					 $scope.martsiaInstance.types,
					 web3.utils.asciiToHex(hashLinks.data.hash1),
					 web3.utils.asciiToHex(hashLinks.data.hash2),
				 ).send({from: '0x2eDFDA2154998dfe682996ff43DE98323de86dd9'});

				console.log(instance.martsiaId);
				console.log($scope.martsiaInstance.elementWithConditions)
				console.log($scope.martsiaInstance.elementWithPublicVar);
				console.log($scope.martsiaInstance.publicvariables);
				console.log($scope.martsiaInstance.operators);
				console.log($scope.martsiaInstance.values);

				const condition = await $scope.stateContract.methods.createConditions(
					 instance.martsiaId,
					 $scope.martsiaInstance.elementWithConditions						,
					 $scope.martsiaInstance.elementWithPublicVar,
					 $scope.martsiaInstance.publicvariables,
					 $scope.martsiaInstance.operators,
					 $scope.martsiaInstance.values,
				 ).send({from: '0x2eDFDA2154998dfe682996ff43DE98323de86dd9'});
				 console.log(condition);
			}
			$scope.addReader = function(key){
				$scope.martsiaInstance.policy[key].push("");
			}

			$scope.generateMartsiaInstance = function(model, instanceId, martsiaId, instance){
				$scope.instance = instance;
				$scope.model = model;
				if(Object.keys($scope.martsiaInstance).length === 0 && $scope.martsiaInstance.constructor === Object) {
					service.deploy(instance.id, $cookies.get('UserId')).then(async function (response) {
						sessionStorage.setItem('contract', JSON.stringify(response.data));
						service.generateMartsiaInstance(instanceId, $cookies.get('UserId')).then(async function (response) {
							$scope.martsiaInstance = response.data;
							console.log(response.data);
							$cookies.put('taskIdAndMartsiaId', JSON.stringify(response.data.taskIdAndMartsiaId));
							//console.log(JSON.parse($cookies.get('taskIdAndMartsiaId')));

						});
					});
				}
			}


			$scope.getContracts = function(){
				//console.log("COOKIE: " + $cookies.get('UserId'));
				service.getContracts($cookies.get('UserId')).then(function(response){
					//console.log(response.data);
					$scope.contracts = response.data;
				})
			}

			$scope.getXml = function(filename){
				service.getXml(filename).then(function(response){
					$scope.model = response.data;
					//console.log($scope.model);
				});
			}

			$scope.getContractFromInstance = function(instanceId, role){


				service.getContractFromInstance(instanceId).then(function(response){
					//console.log(response.data.abi);
					//console.log(response.data.address);
				//	$scope.myContract = new web3.eth.Contract(JSON.parse(response.data.abi), response.data.address);

					service.newSubscribe(instanceId, user.role, $cookies.get('UserId')).then(function(receipt){
						console.log(receipt);
					});
				/*	$scope.myContract.methods.subscribe_as_participant($scope.user.role).send({
						from : $scope.user.address,
						gas: 200000,
					}).then(function(receipt){
						console.log(receipt);
						service.newSubscribe(instanceId, user.role, $cookies.get('UserId')).then(function(receipt){

						});
					});*/
				});
			}

			$scope.optionalSubscribe = function(instanceId, roletosubscribe){
				var userId = $cookies.get('UserId');

					//$scope.user = response.data;
					service.getContractFromInstance(instanceId).then(function(response){
						$scope.myContract = new web3.eth.Contract(JSON.parse(response.data.abi), response.data.address);

						$scope.myContract.methods.subscribe_as_participant(roletosubscribe).send({
							from : $scope.user.address,
							gas: 200000,
						}).then(function(receipt){
							service.newSubscribe(instanceId, roletosubscribe, $cookies.get('UserId')).then(function(receipt){
							});
						});
					});


			}
			$scope.addMeta = function(){
				$window.addEventListener("load", function() {
				    if (typeof web3 !== "undefined") {
				     web3 = new Web3(web3.currentProvider);
				     //console.log(web3);
				      //web3.eth.getAccounts().then(console.log);
				    } else {
				      console.log("No web3? You should consider trying MetaMask!");
				    }

				  });
			}

			$scope.setUser = function(){
				if($cookies.get('UserId') != null){
					$scope.isLogged = true;
					var userId = $cookies.get('UserId');
					service.setUser(userId).then(function(response){
						$scope.user = response.data;
					});
				}else{
					$scope.isLogged = false;
				}
			}

			$scope.setOs = function(){

					$scope.redirect = "http://localhost:8081/ChorChain/"

			}

			//$scope.setUser();
			$scope.addMeta();
			$scope.setOs();
			$scope.martsiaAbi = [
				{
					"anonymous": false,
					"inputs": [
						{
							"indexed": true,
							"internalType": "uint64",
							"name": "process_id",
							"type": "uint64"
						},
						{
							"indexed": true,
							"internalType": "address",
							"name": "user",
							"type": "address"
						},
						{
							"indexed": false,
							"internalType": "address[]",
							"name": "authorities",
							"type": "address[]"
						}
					],
					"name": "AuthoritiesNotified",
					"type": "event"
				},
				{
					"anonymous": false,
					"inputs": [
						{
							"indexed": false,
							"internalType": "uint64",
							"name": "",
							"type": "uint64"
						},
						{
							"indexed": false,
							"internalType": "uint64",
							"name": "",
							"type": "uint64"
						}
					],
					"name": "functionDone",
					"type": "event"
				},
				{
					"inputs": [
						{
							"internalType": "address",
							"name": "_address",
							"type": "address"
						},
						{
							"internalType": "uint64",
							"name": "_instanceID",
							"type": "uint64"
						}
					],
					"name": "getAuthoritiesNames",
					"outputs": [
						{
							"internalType": "bytes",
							"name": "",
							"type": "bytes"
						}
					],
					"stateMutability": "view",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "address",
							"name": "_address",
							"type": "address"
						},
						{
							"internalType": "uint64",
							"name": "_instanceID",
							"type": "uint64"
						}
					],
					"name": "getElement",
					"outputs": [
						{
							"internalType": "bytes",
							"name": "",
							"type": "bytes"
						},
						{
							"internalType": "bytes32",
							"name": "",
							"type": "bytes32"
						},
						{
							"internalType": "bytes",
							"name": "",
							"type": "bytes"
						},
						{
							"internalType": "bytes32",
							"name": "",
							"type": "bytes32"
						}
					],
					"stateMutability": "view",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "address",
							"name": "_address",
							"type": "address"
						},
						{
							"internalType": "uint64",
							"name": "_instanceID",
							"type": "uint64"
						}
					],
					"name": "getElementHashed",
					"outputs": [
						{
							"internalType": "bytes",
							"name": "",
							"type": "bytes"
						},
						{
							"internalType": "bytes",
							"name": "",
							"type": "bytes"
						}
					],
					"stateMutability": "view",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "_messageID",
							"type": "uint64"
						}
					],
					"name": "getIPFSLink",
					"outputs": [
						{
							"internalType": "address",
							"name": "",
							"type": "address"
						},
						{
							"internalType": "bytes",
							"name": "",
							"type": "bytes"
						}
					],
					"stateMutability": "view",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "address",
							"name": "_address",
							"type": "address"
						},
						{
							"internalType": "uint64",
							"name": "_instanceID",
							"type": "uint64"
						}
					],
					"name": "getPublicKey",
					"outputs": [
						{
							"internalType": "bytes",
							"name": "",
							"type": "bytes"
						}
					],
					"stateMutability": "view",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "address",
							"name": "_address",
							"type": "address"
						}
					],
					"name": "getPublicKeyReaders",
					"outputs": [
						{
							"internalType": "bytes",
							"name": "",
							"type": "bytes"
						}
					],
					"stateMutability": "view",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "address",
							"name": "_address",
							"type": "address"
						},
						{
							"internalType": "uint64",
							"name": "_instanceID",
							"type": "uint64"
						}
					],
					"name": "getPublicParameters",
					"outputs": [
						{
							"internalType": "bytes",
							"name": "",
							"type": "bytes"
						}
					],
					"stateMutability": "view",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "_instanceID",
							"type": "uint64"
						}
					],
					"name": "getUserAttributes",
					"outputs": [
						{
							"internalType": "bytes",
							"name": "",
							"type": "bytes"
						}
					],
					"stateMutability": "view",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "_instanceID",
							"type": "uint64"
						},
						{
							"internalType": "address[]",
							"name": "_authorities",
							"type": "address[]"
						}
					],
					"name": "notifyAuthorities",
					"outputs": [],
					"stateMutability": "nonpayable",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "_instanceID",
							"type": "uint64"
						},
						{
							"internalType": "bytes32",
							"name": "_hash1",
							"type": "bytes32"
						},
						{
							"internalType": "bytes32",
							"name": "_hash2",
							"type": "bytes32"
						}
					],
					"name": "setAuthoritiesNames",
					"outputs": [],
					"stateMutability": "nonpayable",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "_instanceID",
							"type": "uint64"
						},
						{
							"internalType": "bytes32",
							"name": "_hash1",
							"type": "bytes32"
						},
						{
							"internalType": "bytes32",
							"name": "_hash2",
							"type": "bytes32"
						},
						{
							"internalType": "bytes32",
							"name": "_hash3",
							"type": "bytes32"
						},
						{
							"internalType": "bytes32",
							"name": "_hash4",
							"type": "bytes32"
						},
						{
							"internalType": "bytes32",
							"name": "_hash5",
							"type": "bytes32"
						},
						{
							"internalType": "bytes32",
							"name": "_hash6",
							"type": "bytes32"
						}
					],
					"name": "setElement",
					"outputs": [],
					"stateMutability": "nonpayable",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "_instanceID",
							"type": "uint64"
						},
						{
							"internalType": "bytes32",
							"name": "_hash1",
							"type": "bytes32"
						},
						{
							"internalType": "bytes32",
							"name": "_hash2",
							"type": "bytes32"
						},
						{
							"internalType": "bytes32",
							"name": "_hash3",
							"type": "bytes32"
						},
						{
							"internalType": "bytes32",
							"name": "_hash4",
							"type": "bytes32"
						}
					],
					"name": "setElementHashed",
					"outputs": [],
					"stateMutability": "nonpayable",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "instanceId",
							"type": "uint64"
						},
						{
							"internalType": "uint64",
							"name": "_messageID",
							"type": "uint64"
						},
						{
							"internalType": "bytes32",
							"name": "_hash1",
							"type": "bytes32"
						},
						{
							"internalType": "bytes32",
							"name": "_hash2",
							"type": "bytes32"
						},
						{
							"internalType": "bytes32[]",
							"name": "publicvarNames",
							"type": "bytes32[]"
						},
						{
							"internalType": "bytes32[]",
							"name": "publicVarValues",
							"type": "bytes32[]"
						}
					],
					"name": "setIPFSLink",
					"outputs": [],
					"stateMutability": "nonpayable",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "_instanceID",
							"type": "uint64"
						},
						{
							"internalType": "bytes32",
							"name": "_hash1",
							"type": "bytes32"
						},
						{
							"internalType": "bytes32",
							"name": "_hash2",
							"type": "bytes32"
						}
					],
					"name": "setPublicKey",
					"outputs": [],
					"stateMutability": "nonpayable",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "bytes32",
							"name": "_hash1",
							"type": "bytes32"
						},
						{
							"internalType": "bytes32",
							"name": "_hash2",
							"type": "bytes32"
						}
					],
					"name": "setPublicKeyReaders",
					"outputs": [],
					"stateMutability": "nonpayable",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "_instanceID",
							"type": "uint64"
						},
						{
							"internalType": "bytes32",
							"name": "_hash1",
							"type": "bytes32"
						},
						{
							"internalType": "bytes32",
							"name": "_hash2",
							"type": "bytes32"
						}
					],
					"name": "setPublicParameters",
					"outputs": [],
					"stateMutability": "nonpayable",
					"type": "function"
				},
				{
					"inputs": [],
					"name": "setStateAddress",
					"outputs": [],
					"stateMutability": "nonpayable",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "_instanceID",
							"type": "uint64"
						},
						{
							"internalType": "bytes32",
							"name": "_hash1",
							"type": "bytes32"
						},
						{
							"internalType": "bytes32",
							"name": "_hash2",
							"type": "bytes32"
						}
					],
					"name": "setUserAttributes",
					"outputs": [],
					"stateMutability": "nonpayable",
					"type": "function"
				}
			]



			$scope.stateAbi = [
				{
					"inputs": [
						{
							"internalType": "address",
							"name": "martsiaAddress",
							"type": "address"
						}
					],
					"stateMutability": "nonpayable",
					"type": "constructor"
				},
				{
					"anonymous": false,
					"inputs": [
						{
							"indexed": false,
							"internalType": "uint64",
							"name": "",
							"type": "uint64"
						},
						{
							"indexed": false,
							"internalType": "uint64",
							"name": "",
							"type": "uint64"
						}
					],
					"name": "functionDone",
					"type": "event"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "instanceId",
							"type": "uint64"
						},
						{
							"internalType": "uint64",
							"name": "elementToExecute",
							"type": "uint64"
						}
					],
					"name": "changeStatus",
					"outputs": [],
					"stateMutability": "nonpayable",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "instanceId",
							"type": "uint64"
						},
						{
							"internalType": "uint64",
							"name": "msgToExecute",
							"type": "uint64"
						}
					],
					"name": "checkEventBased",
					"outputs": [],
					"stateMutability": "nonpayable",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "instanceId",
							"type": "uint64"
						},
						{
							"internalType": "uint64",
							"name": "msgToExecute",
							"type": "uint64"
						},
						{
							"internalType": "bytes32[]",
							"name": "publicvarNames",
							"type": "bytes32[]"
						},
						{
							"internalType": "bytes32[]",
							"name": "publicVarValues",
							"type": "bytes32[]"
						}
					],
					"name": "cipher",
					"outputs": [],
					"stateMutability": "nonpayable",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "instanceId",
							"type": "uint64"
						},
						{
							"internalType": "uint64[]",
							"name": "elementWithConditions",
							"type": "uint64[]"
						},
						{
							"internalType": "uint64[]",
							"name": "elementWithPublicVar",
							"type": "uint64[]"
						},
						{
							"internalType": "bytes32[]",
							"name": "publicVars",
							"type": "bytes32[]"
						},
						{
							"internalType": "enum StateContract.Operator[]",
							"name": "operators",
							"type": "uint8[]"
						},
						{
							"internalType": "bytes32[]",
							"name": "values",
							"type": "bytes32[]"
						}
					],
					"name": "createConditions",
					"outputs": [],
					"stateMutability": "nonpayable",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "instanceId",
							"type": "uint64"
						},
						{
							"internalType": "uint64",
							"name": "element",
							"type": "uint64"
						},
						{
							"internalType": "bytes32",
							"name": "varName",
							"type": "bytes32"
						}
					],
					"name": "getAllowedVar",
					"outputs": [
						{
							"internalType": "bool",
							"name": "",
							"type": "bool"
						}
					],
					"stateMutability": "view",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "instanceId",
							"type": "uint64"
						},
						{
							"internalType": "uint64",
							"name": "element",
							"type": "uint64"
						}
					],
					"name": "getCondition",
					"outputs": [
						{
							"components": [
								{
									"internalType": "bytes32",
									"name": "publicVar",
									"type": "bytes32"
								},
								{
									"internalType": "enum StateContract.Operator",
									"name": "op",
									"type": "uint8"
								},
								{
									"internalType": "bytes32",
									"name": "value",
									"type": "bytes32"
								}
							],
							"internalType": "struct StateContract.Condition",
							"name": "",
							"type": "tuple"
						}
					],
					"stateMutability": "view",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "instanceId",
							"type": "uint64"
						},
						{
							"internalType": "uint64",
							"name": "_element",
							"type": "uint64"
						}
					],
					"name": "getInstanceElement",
					"outputs": [
						{
							"components": [
								{
									"internalType": "enum StateContract.ElementState",
									"name": "state",
									"type": "uint8"
								},
								{
									"internalType": "enum StateContract.ElementType",
									"name": "elementType",
									"type": "uint8"
								},
								{
									"internalType": "bytes32",
									"name": "role",
									"type": "bytes32"
								},
								{
									"internalType": "uint64[]",
									"name": "next",
									"type": "uint64[]"
								},
								{
									"internalType": "uint64[]",
									"name": "previous",
									"type": "uint64[]"
								}
							],
							"internalType": "struct StateContract.Element",
							"name": "",
							"type": "tuple"
						}
					],
					"stateMutability": "view",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "instanceId",
							"type": "uint64"
						}
					],
					"name": "getInstancePolicy",
					"outputs": [
						{
							"internalType": "bytes",
							"name": "",
							"type": "bytes"
						}
					],
					"stateMutability": "view",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "instanceId",
							"type": "uint64"
						},
						{
							"internalType": "uint64",
							"name": "msgToExecute",
							"type": "uint64"
						},
						{
							"internalType": "address",
							"name": "user",
							"type": "address"
						}
					],
					"name": "getMartsiaChecks",
					"outputs": [
						{
							"internalType": "bool",
							"name": "",
							"type": "bool"
						}
					],
					"stateMutability": "view",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "instanceId",
							"type": "uint64"
						},
						{
							"internalType": "bytes32[]",
							"name": "_roles",
							"type": "bytes32[]"
						},
						{
							"internalType": "address[]",
							"name": "users",
							"type": "address[]"
						},
						{
							"internalType": "uint64[]",
							"name": "elements",
							"type": "uint64[]"
						},
						{
							"internalType": "uint64[][]",
							"name": "nextElements",
							"type": "uint64[][]"
						},
						{
							"internalType": "uint64[][]",
							"name": "previousElements",
							"type": "uint64[][]"
						},
						{
							"internalType": "enum StateContract.ElementType[]",
							"name": "types",
							"type": "uint8[]"
						},
						{
							"internalType": "bytes32",
							"name": "policy1",
							"type": "bytes32"
						},
						{
							"internalType": "bytes32",
							"name": "policy2",
							"type": "bytes32"
						}
					],
					"name": "instantiateProcess",
					"outputs": [],
					"stateMutability": "nonpayable",
					"type": "function"
				},
				{
					"inputs": [
						{
							"internalType": "uint64",
							"name": "instanceId",
							"type": "uint64"
						},
						{
							"internalType": "uint64",
							"name": "msgToExecute",
							"type": "uint64"
						},
						{
							"internalType": "bytes32[]",
							"name": "publicVarNames",
							"type": "bytes32[]"
						},
						{
							"internalType": "bytes32[]",
							"name": "publicVarValues",
							"type": "bytes32[]"
						}
					],
					"name": "setPublicvariables",
					"outputs": [],
					"stateMutability": "nonpayable",
					"type": "function"
				}
			]

		}]);
