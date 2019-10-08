
/** @type {HTMLTextAreaElement} **/
const input = document.querySelector("#json");
const output = document.querySelector("#typedef");

input.addEventListener("input", () => {
    output.value = convertJSON(input.value);
});


class PropDef {
    /**
     * 
     * @param {string} name
     * @param {any} value
     * @param {Typedef} parent
     */
    constructor(name, value, parent) {
        this.name = name;
        this.type = "null";
        /** template param for arrays etc */
        this.template = "any";
        // Nested properties, which the parent should collect and clear
        /** @type {PropDef[]} **/
        this.subproperties = [];
        if (typeof value == "object") {
            if (value == null) {
                this.type = "null";
            }
            else if (value instanceof Array) {
                this.type = "array";
                if (value.length > 0) {
                    this.template = parent.typename(value[0]);
                    if (this.template == "null") {
                        this.template = "any";
                    }
                }
            }
            else if (typeof value.constructor == "function" && value.constructor!=Object) {
                this.type = value.constructor.name;
            }
            else {
                this.type = "Object";
                for (let subname in value) {
                    if (value.hasOwnProperty(subname)) {
                        const subvalue = value[subname];
                        this.subproperties.push(new PropDef(this.name+"." + subname, subvalue, parent));
                    }
                }
            }
        }
        else {
            this.type = typeof value;
        }
    }
    /**
     * @returns {IterableIterator<PropDef>}
     * */
    *allSubProperties() {
        for (const prop of this.subproperties) {
            yield prop;
            for (const subProp of prop.allSubProperties()) {
                yield subProp;
            }
        }
    }
    /** Returns string content of the property definition */
    toDef() {
        return `@property {${this.jsdocTypeName}} ${this.name} description`;
    }
    get jsdocTypeName() {
        if (this.template != "null" && this.template != "any") {
            if (this.type != "array") {
                return this.type + "<" + this.template + ">";
            }
            else {
                return this.template + "[]";
            }
        }
        else {
            return this.type;
        }
    }
    /**
     * 
     * @param {PropDef} other
     */
    equals(other) {
        if (other.name == this.name) {
            if (this.type == other.type) {
                if (this.template == other.template) {
                    return true;
                }
                else if (this.type == "array" && (this.template == "" || other.template == "")) {
                    return true;
                }
            }
            else if (this.type == "null" || other.type == "null") {
                return true;
            }
        }
        return false;
    }
    /**
     * 
     * @param {PropDef} other
     */
    enrichSelf(other) {
        if (this.type == "any" || this.type == "null") {
            this.type = other.type;
        }
        if (this.template == "null") {
            this.template = other.template;
        }
    }
}
let TYPE_INDEX = 1;
class Typedef {
    constructor(source) {
        this.name = "Typedef_" + (TYPE_INDEX++);
        /** @type {Typedef[]} **/
        this.priorTypedefs = [];
        /** @type {PropDef[]} **/
        this.properties = [];

        this.parse(source);
    }
    parse(source) {
        for (let name in source) {
            if (source.hasOwnProperty(name)) {
                const value = source[name];
                const newProp = new PropDef(name, value, this);
                this.properties.push(newProp);
                this.properties.push(...newProp.allSubProperties());
            }
        }
    }
    /**
     * Find or create type for an object
     * @param {any} object
     */
    typename(object) {
        if (typeof object == "object") {
            if (object == null) {
                return "null";
            }
            else {
                const dummy = new Typedef(object);
                for (const def of this.allParentTypedefs()) {
                    if (def.equals(dummy)) {
                        def.enrichSelf(dummy);
                        return def;
                    }
                }
                this.priorTypedefs.push(dummy);
                return dummy.name;
            }
        }
        else {
            return typeof object;
        }
    }
    *allParentTypedefs() {
        const stack = [this];
        while (stack.length > 0) {
            const current = stack.shift();
            stack.push(...current.priorTypedefs);
            for (const def of current.priorTypedefs) {
                yield def;
            }
        }
    }
    /**
     * Try to get additional info (types/templates)
     * @param {Typedef} other
     */
    enrichSelf(other) {
        for (const prop of this.properties) {
            const otherprop = other.properties.find((x) => x.equals(prop));
            if (otherprop) {
                prop.enrichSelf(otherProp);
            }
        }
    }
    /**
     * 
     * @param {Typedef} other
     */
    equals(other) {
        if (other.properties.length == this.properties.length) {
            for (const prop of this.properties) {
                if (!other.properties.find((x) => x.equals(prop))) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    toJSDoc() {
        const begin = `/**
 * @typedef {Object} ${this.name} - description`;

        let result = "";
        // first add nested typedefs
        for (const typedef of this.priorTypedefs) {
            result += typedef.toJSDoc() + "\r\n";

        }
        result += begin + "\r\n";
        for (const prop of this.properties) {
            result += " * " + prop.toDef() + "\r\n";
        }
        result += " */";
        return result;
    }
}


function convertJSON(json) {
    try {
        const obj = JSON.parse(json);
        const parsed = new Typedef(obj);
        console.log(parsed);
        return parsed.toJSDoc();
    }
    catch (e) {
        console.error(e);
    }
}