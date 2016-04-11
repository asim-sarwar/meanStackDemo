var app = angular.module('chirpApp', ['ngRoute', 'ngResource']).run(function($rootScope, $http, $location ,sessionService) {
	$rootScope.authenticated = false;
	$rootScope.current_user = '';
	
	$rootScope.signout = function(){
    	$http.get('auth/signout');
    	$rootScope.authenticated = false;
    	sessionService.destroy('uid');
    	$rootScope.current_user = '';
	};
});



app.config(function($routeProvider){
	$routeProvider
		//the timeline display
		.when('/', {
			templateUrl: 'pList.html',
			controller: 'mainController'
		})
		.when('/postsList', {
			templateUrl: 'main.html',
			controller: 'mainController'
		})
		//the login display
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'authController'
		})
		//the signup display
		.when('/register', {
			templateUrl: 'register.html',
			controller: 'authController'
		});
});

app.factory('postService', function($resource){
	return $resource('/api/posts/:id', null, {
            'update': { method:'PUT' }
          });
});

app.factory('loginService', function($http, $rootScope, $location, sessionService){
	return{
		login:function(user,scope){
			$http.post('/auth/login', user).success(function(data){
		      if(data.state == 'success'){
		        $rootScope.authenticated = true;
		        sessionService.set('uid',data.user._id);
		        //console.log(sessionService.get('uid'));
		        $rootScope.current_user = data.user.username;        
		        $location.path('/postsList');
		      }
		      else{
		        scope.error_message = data.message;
		      }
		    });
		},
		
		islogged:function(){			
			 if(sessionService.get('uid')) return $rootScope.authenticated = true;			
		}
	}
});

app.run(function($rootScope, $location, loginService){

	 var routespermission=['/postsList'];  //route that require login
	 $rootScope.$on('$routeChangeStart', function(){
	 	if( routespermission.indexOf($location.path()) !=-1 && !loginService.islogged())
	 	{
			 $location.path('/login');
		}
	});
});

app.factory('sessionService', function($http){
	return{
		set:function(key,value){
			return sessionStorage.setItem(key,value);
		},
		get:function(key){
			return sessionStorage.getItem(key);
		},
		destroy:function(key){
			//$http.post('data/destroy_session.php');
			return sessionStorage.removeItem(key);
		}
	};
});


app.controller('authController', function(loginService, $scope, $http, $rootScope, $location){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login=function(){
		console.log($scope.user);
		loginService.login($scope.user,$scope); //call login service
	};

  // $scope.login = function(){
  //   $http.post('/auth/login', $scope.user).success(function(data){
  //     if(data.state == 'success'){
  //       $rootScope.authenticated = true;
  //       $rootScope.current_user = data.user.username;        
  //       $location.path('/');
  //     }
  //     else{
  //       $scope.error_message = data.message;
  //     }
  //   });
  // };

  $scope.register = function(){
    $http.post('/auth/signup', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };
 
});

app.controller('mainController', function(postService, $scope, $rootScope){
	$scope.editing = [];
	$scope.posts = postService.query();
	$scope.newPost = {created_by: '', text: '', created_at: ''};
	
	$scope.post = function() {
	  $scope.newPost.created_by = $rootScope.current_user;
	  $scope.newPost.created_at = Date.now();
	  postService.save($scope.newPost, function(){
	    $scope.posts = postService.query();
	    $scope.newPost = {created_by: '', text: '', created_at: ''};
	  });
	};

	$scope.update = function(index){

	    var post = $scope.posts[index];	    	    
	    postService.update({id: post._id}, post);
	    $scope.editing[index] = false;
	};

	$scope.edit = function(index){		
	    $scope.editing[index] = angular.copy($scope.posts[index]);
	};

    $scope.cancel = function(index){
	    $scope.posts[index] = angular.copy($scope.editing[index]);
	    $scope.editing[index] = false;
    };

    $scope.remove = function(index){
	    var post = $scope.posts[index];
	    postService.remove({id: post._id}, function(){
	      $scope.posts.splice(index, 1);
	    });
    };	


});

