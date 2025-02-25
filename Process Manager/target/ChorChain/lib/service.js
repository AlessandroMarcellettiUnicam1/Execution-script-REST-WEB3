'use strict'

angular.module('homePage.services', []).factory('service',
		[ "$http", function($http) {
			var service = {};
			var user = {};
			
			service.setUser = function(localUser){
				user = localUser;
			}
			service.getUser = function(){
				return user;
			}

			service.getModels = function(){
				return $http.get("rest/getModels");
			}
			
			service.registerUser = function(user){
				
				return $http.post("rest/reg/" , user);
			}
			
			service.loginUser = function(user){
				return $http.post("rest/login/", user);
			}
			
			service.getModels = function(){
				return $http.post("rest/getModels");
			}
			
			service.subscribe = function(instanceId, role, cookieId){
				console.log("rest/subscribe/" + role + "/" + cookieId + "/" + instanceId);
				return $http.post("rest/subscribe/" + role + "/" + cookieId + "/" + instanceId, {});
			}
			
			service.getInstances = function(model){
				return $http.post("rest/getInstances/", model);
			}
			service.getParticipants = function(instanceId) {
				return $http.post("rest/getPart/" + instanceId);
			}

			service.createInstance = function(model, cookieId, optional, mandatory, visibleAt){
				 var data = {modelID:model.id, optional:optional, mandatory:mandatory, visibleAt:visibleAt};
				console.log(data);
				var res = $http.post("rest/createInstance/" + cookieId ,data);
				return res;
			}
			
			service.deploy = function(instanceId, cookieId){
				return $http.post("rest/deploy/" + cookieId + "/" + instanceId, {});
			}
			service.generateMartsiaInstance = function(instanceId, cookieId){
				return $http.post("rest/generateMartsiaInstance/" + cookieId + "/" + instanceId, {});
			}
			service.getContracts = function(cookieId){
				return $http.post("rest/getCont/" + cookieId);
			}
			service.getXml = function(modelname){
				return $http.post("rest/getXml/" + modelname);
			}
			service.getContractFromInstance = function(instanceId){
				return $http.post("rest/getContractFromInstance/" + instanceId);
			}
			service.setUser = function(userId){
				return $http.post("rest/getUserInfo/" + userId);
			}
			service.newSubscribe = function(instanceId, role, cookieId){
				return $http.post("rest/newSubscribe/" + instanceId + "/" + role + "/" + cookieId);
			}

			service.chorsiaSettings = function(input){
				return $http.post("http://172.31.83.251:8888/settings/", input);
			}

			service.subscribe_generateRSA = function(input){
				return $http.post('http://172.31.83.251:8888/certification/generate_rsa_key_pair', input);
			}

			service.certification = function(input){
				console.log(input);
				return $http.post('http://172.31.83.251:8888/certification/attributes_certification_and_authorities', input);
			}

			service.chorsiaCertification1 = function(input){
				return $http.post("http://172.31.83.251:8888/certification/readpublickey/", input);
			}

			service.chorsiaCertification2 = function(input){
				return $http.post("http://172.31.83.251:8888/certification/attributecertification/", input);
			}




			//-----------------service part dedicated to Martsia--------------------------
			service.sendMessageToMartsia = function(instanceId, messageId, messagePayload){
				const process_instance_id = 1234567
				input = {'process_id': process_instance_id}
				return $http.post("http://172.31.83.251:8888/dataOwner/generate_pp_kk", json = input);
			}
			service.readMartsiaMessage = function(){

			}


			return service;
		}]);
