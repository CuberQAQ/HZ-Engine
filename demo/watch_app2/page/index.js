var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
import { getText } from "@zos/i18n";
import { ArchiveStateAccessor, ArchiveStateGetter, ArchiveStateSetter } from "../shared/decorator";
Page({
    build() {
        console.log(getText("example"));
        console.log("Ciallo");
        // console.log(`eval result=${evalExpression('sf.a+gf.b')}`);
        let test = new ArchiveStateTest();
        console.log(`testGet=${test.testGet}`);
        console.log(`testSet=${test.testSet = 100}`);
        console.log(`testAccessor get=${test.testAccessor}`);
        console.log(`testAccessor set=${test.testAccessor = 200}`);
    },
});
let ArchiveStateTest = (() => {
    var _a, _ArchiveStateTest_testSet, _ArchiveStateTest_testAccessor_accessor_storage;
    let _instanceExtraInitializers = [];
    let _get_testGet_decorators;
    let _set_testSet_decorators;
    let _testAccessor_decorators;
    let _testAccessor_initializers = [];
    return _a = class ArchiveStateTest {
            get testGet() {
                return 1;
            }
            /**
             * @param {number} val
             */
            set testSet(val) {
                __classPrivateFieldSet(this, _ArchiveStateTest_testSet, val, "f");
            }
            get testAccessor() { return __classPrivateFieldGet(this, _ArchiveStateTest_testAccessor_accessor_storage, "f"); }
            set testAccessor(value) { __classPrivateFieldSet(this, _ArchiveStateTest_testAccessor_accessor_storage, value, "f"); }
            constructor() {
                this._core = (__runInitializers(this, _instanceExtraInitializers), {});
                _ArchiveStateTest_testSet.set(this, 1
                /**
                 * @param {number} val
                 */
                );
                _ArchiveStateTest_testAccessor_accessor_storage.set(this, __runInitializers(this, _testAccessor_initializers, 2));
            }
        },
        _ArchiveStateTest_testSet = new WeakMap(),
        _ArchiveStateTest_testAccessor_accessor_storage = new WeakMap(),
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _get_testGet_decorators = [ArchiveStateGetter("testGet")];
            _set_testSet_decorators = [ArchiveStateSetter("testSet")];
            _testAccessor_decorators = [ArchiveStateAccessor("testAccessor")];
            __esDecorate(_a, null, _get_testGet_decorators, { kind: "getter", name: "testGet", static: false, private: false, access: { has: obj => "testGet" in obj, get: obj => obj.testGet }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _set_testSet_decorators, { kind: "setter", name: "testSet", static: false, private: false, access: { has: obj => "testSet" in obj, set: (obj, value) => { obj.testSet = value; } }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _testAccessor_decorators, { kind: "accessor", name: "testAccessor", static: false, private: false, access: { has: obj => "testAccessor" in obj, get: obj => obj.testAccessor, set: (obj, value) => { obj.testAccessor = value; } }, metadata: _metadata }, _testAccessor_initializers, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
