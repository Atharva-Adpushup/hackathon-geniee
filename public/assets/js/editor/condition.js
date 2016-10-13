var _ = require("libs/third-party/underscore");
var ConditionParser = (function () {
    return function (str) {
        this.str = str;
        this.pos = 0;

        var temp = "";
        this.next = function () {
            if (this.pos >= this.str.length)
                return false;

            temp = this.str.substr(this.pos, this.str.length);
            for (var i = 0, chr = null, acc = ""; i < str.length; i++) {
                this.pos++;
                chr = temp[i];
                switch (chr) {
                    case "(":
                        if (acc.length) {
                            this.pos--;
                            return acc;
                        }
                        return "(";
                        break;
                    case ")":
                        if (acc.length) {
                            this.pos--;
                            return acc;
                        }
                        return ")";
                        break;
                    case " ":
                        if (acc.length)
                            return acc;
                        continue;
                    default:
                        acc += chr;
                }
            }
        }
    }
})();


var Condition = (function (ConditionParser) {
    var Condition = function () {
        this.stack = [];
    }

    Condition.prototype.addOperand = function (operand) {
        if (this.stack.length % 2 != 0)
            throw new Error("Operation needed.")

        if (!(operand instanceof Condition)) {
            operand = {"type": "operand", value: operand}
        }
        this.stack.push(operand);
    }

    Condition.prototype.addOperation = function (operation) {
        if (this.stack.length % 2 !== 0)
            this.stack.push({"type": "operation", value: operation});
        else
            throw new Error("Operand needed.")
    }

    Condition.prototype.toSTRING = function () {
        if (this.stack.length % 2 == 0) {
            this.stack = this.stack.splice(this.stack.length - 1, 1);
        }
        var s = [];
        _.each(this.stack, function (obj) {
            if (obj instanceof Condition) {
                s.push("(");
                s.push(obj.toSTRING());
                s.push(")");
            } else {
                s.push(obj.value)
            }
        })
        return s.join(" ");
    }

    Condition.prototype.toJSON = function () {
        var json = {condition: []}
        _.each(this.stack, function (obj) {
            if (obj instanceof Condition) {
                json.condition.push(obj.toJSON())
            }
            else {
                json.condition.push(obj)
            }
        })
        return json;
    }

    Condition.parseFromString = function (parserObj) {
        if (!(parserObj instanceof ConditionParser) && typeof parserObj == "string") {
            parserObj = new ConditionParser(parserObj);
        }
        var str, root = new Condition();
        while (1) {
            str = parserObj.next();
            switch (str) {
                case false:
                    return root;
                    break;
                case "(":
                    root.addOperand(Condition.parseFromString(parserObj));
                    break;
                case ")":
                    return root;
                    break;
                default:
                    if (root.stack.length % 2 == 0) {
                        root.addOperand(str);
                    }
                    else {
                        root.addOperation(str);

                    }
            }
        }
    }

    Condition.parseFromJson = function (json) {
        function jsonToString(json) {
            var stack = [];
            _.each(json.condition, function (obj) {
                if (obj.hasOwnProperty("condition")) {
                    stack.push("(");
                    stack.push(jsonToString(obj))
                    stack.push(")");
                }
                else {
                    stack.push(obj.value)
                }
            });
            return stack;
        }

        console.log(jsonToString(json).join(" ").replace(/,/g, " "));
        return this.parseFromString(jsonToString(json).join(" ").replace(/,/g, " "));

    }


    return Condition;

})(ConditionParser);

module.exports = Condition;
