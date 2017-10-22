function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

define("login", "lg");
define("logout", "lo");
define("register", "reg");

