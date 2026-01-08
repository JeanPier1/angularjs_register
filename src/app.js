var app = angular.module("miApp", ["ngRoute"]);

app.config(function ($routeProvider) {
  $routeProvider
    .when("/login", {
      templateUrl: "views/login.html",
      controller: "LoginController",
    })
    .when("/subscriptores", {
      templateUrl: "views/subscriptores.html",
      controller: "SubController",
    })
    .otherwise({ redirectTo: "/login" });
});

app.controller("LoginController", function ($scope, $http, $location) {
  $scope.usuario = {};

  $scope.hacerLogin = function () {
    $http
      .post("http://localhost:8000/api/login", $scope.usuario)
      .then(function (res) {
        localStorage.setItem("access_token", res.data.access_token);
        $location.path("/subscriptores");
      })
      .catch(function (err) {
        alert(
          "Error al iniciar sesión: " +
            (err.data.message || "Credenciales inválidas"),
        );
      });
  };
});

app.controller("SubController", function ($scope, $http, $location) {
  var token = localStorage.getItem("access_token");

  if (!token) {
    $location.path("/login");
  }

  var config = { headers: { Authorization: "Bearer " + token } };

  $scope.subscriptores = [];
  $scope.susbcriptor = {};
  $scope.editando = false;
  $scope.loadingsms = false;
  $scope.loading = false;

  $scope.cargarSubscriptores = function () {
    $scope.loading = true;
    $http
      .get("http://localhost:8000/api/subscribers", config)
      .then(function (res) {
        $scope.subscriptores = res.data;
        $scope.loading = false;
      });
  };

  $scope.prepararCrear = function () {
    $scope.editando = false;
    $scope.susbcriptor = {};
  };

  $scope.prepararEditar = function (sub) {
    $scope.editando = true;
    $scope.susbcriptor = angular.copy(sub);
  };

  $scope.generateemails = function () {
    $scope.loadingsms = true;
    $http
      .post("http://localhost:8000/api/subscribers/mail", {}, config)
      .then(function () {
        $scope.loadingsms = false;
        alert("Emails enviados con éxito");
      })
      .catch(function (err) {
        $scope.loadingsms = false;
        console.log("Error al enviar emails: " + err.data.message);
      });
  };

  $scope.guardar = function () {
    $scope.loading = true;

    var url = "http://localhost:8000/api/subscribers";
    var metodo = $scope.editando ? "PUT" : "POST";
    if ($scope.editando) url += "/" + $scope.susbcriptor.id;

    $http({
      method: metodo,
      url: url,
      data: $scope.susbcriptor,
      headers: config.headers,
    })
      .then(function () {
        $scope.loading = false;
        bootstrap.Modal.getInstance(document.getElementById("modalSub")).hide();
        $scope.cargarSubscriptores();
      })
      .catch(function (err) {
        $scope.loading = false;
        console.log(err);
      });
  };

  $scope.eliminar = function (id) {
    if (confirm("¿Estás seguro de eliminar este suscriptor?")) {
      $http
        .delete("http://localhost:8000/api/subscribers/" + id, config)
        .then(function () {
          $scope.cargarSubscriptores();
        });
    }
  };

  $scope.cargarSubscriptores();
});
