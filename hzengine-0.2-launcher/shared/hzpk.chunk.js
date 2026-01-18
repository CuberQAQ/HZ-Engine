import { i as isTextNode, c as assert, A as AsukaUI, d as AsukaUnknownNode } from "./asukaui-platform-zeppos.chunk.js";
import hmFS__default from "@zos/fs";
const equalFn = (a, b) => a === b;
const $PROXY = /* @__PURE__ */ Symbol("solid-proxy");
const SUPPORTS_PROXY = typeof Proxy === "function";
const $TRACK = /* @__PURE__ */ Symbol("solid-track");
const signalOptions = {
  equals: equalFn
};
let runEffects = runQueue;
const STALE = 1;
const PENDING = 2;
const UNOWNED = {
  owned: null,
  cleanups: null,
  context: null,
  owner: null
};
var Owner = null;
let Transition = null;
let ExternalSourceConfig = null;
let Listener = null;
let Updates = null;
let Effects = null;
let ExecCount = 0;
function createRoot(fn, detachedOwner) {
  const listener = Listener, owner = Owner, unowned = fn.length === 0, current = owner, root = unowned ? UNOWNED : {
    owned: null,
    cleanups: null,
    context: current ? current.context : null,
    owner: current
  }, updateFn = unowned ? fn : () => fn(() => untrack(() => cleanNode(root)));
  Owner = root;
  Listener = null;
  try {
    return runUpdates(updateFn, true);
  } finally {
    Listener = listener;
    Owner = owner;
  }
}
function createSignal(value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const s = {
    value,
    observers: null,
    observerSlots: null,
    comparator: options.equals || void 0
  };
  const setter = (value2) => {
    if (typeof value2 === "function") {
      value2 = value2(s.value);
    }
    return writeSignal(s, value2);
  };
  return [readSignal.bind(s), setter];
}
function createRenderEffect(fn, value, options) {
  const c = createComputation(fn, value, false, STALE);
  updateComputation(c);
}
function createMemo(fn, value, options) {
  options = options ? Object.assign({}, signalOptions, options) : signalOptions;
  const c = createComputation(fn, value, true, 0);
  c.observers = null;
  c.observerSlots = null;
  c.comparator = options.equals || void 0;
  updateComputation(c);
  return readSignal.bind(c);
}
function untrack(fn) {
  if (Listener === null) return fn();
  const listener = Listener;
  Listener = null;
  try {
    if (ExternalSourceConfig) ;
    return fn();
  } finally {
    Listener = listener;
  }
}
function onCleanup(fn) {
  if (Owner === null) ;
  else if (Owner.cleanups === null) Owner.cleanups = [fn];
  else Owner.cleanups.push(fn);
  return fn;
}
function children(fn) {
  const children2 = createMemo(fn);
  const memo2 = createMemo(() => resolveChildren(children2()));
  memo2.toArray = () => {
    const c = memo2();
    return Array.isArray(c) ? c : c != null ? [c] : [];
  };
  return memo2;
}
function readSignal() {
  if (this.sources && this.state) {
    if (this.state === STALE) updateComputation(this);
    else {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(this), false);
      Updates = updates;
    }
  }
  if (Listener) {
    const sSlot = this.observers ? this.observers.length : 0;
    if (!Listener.sources) {
      Listener.sources = [this];
      Listener.sourceSlots = [sSlot];
    } else {
      Listener.sources.push(this);
      Listener.sourceSlots.push(sSlot);
    }
    if (!this.observers) {
      this.observers = [Listener];
      this.observerSlots = [Listener.sources.length - 1];
    } else {
      this.observers.push(Listener);
      this.observerSlots.push(Listener.sources.length - 1);
    }
  }
  return this.value;
}
function writeSignal(node, value, isComp) {
  let current = node.value;
  if (!node.comparator || !node.comparator(current, value)) {
    node.value = value;
    if (node.observers && node.observers.length) {
      runUpdates(() => {
        for (let i = 0; i < node.observers.length; i += 1) {
          const o = node.observers[i];
          const TransitionRunning = Transition && Transition.running;
          if (TransitionRunning && Transition.disposed.has(o)) ;
          if (TransitionRunning ? !o.tState : !o.state) {
            if (o.pure) Updates.push(o);
            else Effects.push(o);
            if (o.observers) markDownstream(o);
          }
          if (!TransitionRunning) o.state = STALE;
        }
        if (Updates.length > 1e6) {
          Updates = [];
          if (false) ;
          throw new Error();
        }
      }, false);
    }
  }
  return value;
}
function updateComputation(node) {
  if (!node.fn) return;
  cleanNode(node);
  const time = ExecCount;
  runComputation(
    node,
    node.value,
    time
  );
}
function runComputation(node, value, time) {
  let nextValue;
  const owner = Owner, listener = Listener;
  Listener = Owner = node;
  try {
    nextValue = node.fn(value);
  } catch (err) {
    if (node.pure) {
      {
        node.state = STALE;
        node.owned && node.owned.forEach(cleanNode);
        node.owned = null;
      }
    }
    node.updatedAt = time + 1;
    return handleError(err);
  } finally {
    Listener = listener;
    Owner = owner;
  }
  if (!node.updatedAt || node.updatedAt <= time) {
    if (node.updatedAt != null && "observers" in node) {
      writeSignal(node, nextValue);
    } else node.value = nextValue;
    node.updatedAt = time;
  }
}
function createComputation(fn, init, pure, state = STALE, options) {
  const c = {
    fn,
    state,
    updatedAt: null,
    owned: null,
    sources: null,
    sourceSlots: null,
    cleanups: null,
    value: init,
    owner: Owner,
    context: Owner ? Owner.context : null,
    pure
  };
  if (Owner === null) ;
  else if (Owner !== UNOWNED) {
    {
      if (!Owner.owned) Owner.owned = [c];
      else Owner.owned.push(c);
    }
  }
  return c;
}
function runTop(node) {
  if (node.state === 0) return;
  if (node.state === PENDING) return lookUpstream(node);
  if (node.suspense && untrack(node.suspense.inFallback)) return node.suspense.effects.push(node);
  const ancestors = [node];
  while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
    if (node.state) ancestors.push(node);
  }
  for (let i = ancestors.length - 1; i >= 0; i--) {
    node = ancestors[i];
    if (node.state === STALE) {
      updateComputation(node);
    } else if (node.state === PENDING) {
      const updates = Updates;
      Updates = null;
      runUpdates(() => lookUpstream(node, ancestors[0]), false);
      Updates = updates;
    }
  }
}
function runUpdates(fn, init) {
  if (Updates) return fn();
  let wait = false;
  if (!init) Updates = [];
  if (Effects) wait = true;
  else Effects = [];
  ExecCount++;
  try {
    const res = fn();
    completeUpdates(wait);
    return res;
  } catch (err) {
    if (!wait) Effects = null;
    Updates = null;
    handleError(err);
  }
}
function completeUpdates(wait) {
  if (Updates) {
    runQueue(Updates);
    Updates = null;
  }
  if (wait) return;
  const e = Effects;
  Effects = null;
  if (e.length) runUpdates(() => runEffects(e), false);
}
function runQueue(queue) {
  for (let i = 0; i < queue.length; i++) runTop(queue[i]);
}
function lookUpstream(node, ignore) {
  node.state = 0;
  for (let i = 0; i < node.sources.length; i += 1) {
    const source = node.sources[i];
    if (source.sources) {
      const state = source.state;
      if (state === STALE) {
        if (source !== ignore && (!source.updatedAt || source.updatedAt < ExecCount))
          runTop(source);
      } else if (state === PENDING) lookUpstream(source, ignore);
    }
  }
}
function markDownstream(node) {
  for (let i = 0; i < node.observers.length; i += 1) {
    const o = node.observers[i];
    if (!o.state) {
      o.state = PENDING;
      if (o.pure) Updates.push(o);
      else Effects.push(o);
      o.observers && markDownstream(o);
    }
  }
}
function cleanNode(node) {
  let i;
  if (node.sources) {
    while (node.sources.length) {
      const source = node.sources.pop(), index = node.sourceSlots.pop(), obs = source.observers;
      if (obs && obs.length) {
        const n = obs.pop(), s = source.observerSlots.pop();
        if (index < obs.length) {
          n.sourceSlots[s] = index;
          obs[index] = n;
          source.observerSlots[index] = s;
        }
      }
    }
  }
  if (node.tOwned) {
    for (i = node.tOwned.length - 1; i >= 0; i--) cleanNode(node.tOwned[i]);
    delete node.tOwned;
  }
  if (node.owned) {
    for (i = node.owned.length - 1; i >= 0; i--) cleanNode(node.owned[i]);
    node.owned = null;
  }
  if (node.cleanups) {
    for (i = node.cleanups.length - 1; i >= 0; i--) node.cleanups[i]();
    node.cleanups = null;
  }
  node.state = 0;
}
function castError(err) {
  if (err instanceof Error) return err;
  return new Error(typeof err === "string" ? err : "Unknown error", {
    cause: err
  });
}
function handleError(err, owner = Owner) {
  const error = castError(err);
  throw error;
}
function resolveChildren(children2) {
  if (typeof children2 === "function" && !children2.length) return resolveChildren(children2());
  if (Array.isArray(children2)) {
    const results = [];
    for (let i = 0; i < children2.length; i++) {
      const result = resolveChildren(children2[i]);
      Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
    }
    return results;
  }
  return children2;
}
const FALLBACK = /* @__PURE__ */ Symbol("fallback");
function dispose(d) {
  for (let i = 0; i < d.length; i++) d[i]();
}
function mapArray(list, mapFn, options = {}) {
  let items = [], mapped = [], disposers = [], len = 0, indexes = mapFn.length > 1 ? [] : null;
  onCleanup(() => dispose(disposers));
  return () => {
    let newItems = list() || [], newLen = newItems.length, i, j;
    newItems[$TRACK];
    return untrack(() => {
      let newIndices, newIndicesNext, temp, tempdisposers, tempIndexes, start, end, newEnd, item;
      if (newLen === 0) {
        if (len !== 0) {
          dispose(disposers);
          disposers = [];
          items = [];
          mapped = [];
          len = 0;
          indexes && (indexes = []);
        }
        if (options.fallback) {
          items = [FALLBACK];
          mapped[0] = createRoot((disposer) => {
            disposers[0] = disposer;
            return options.fallback();
          });
          len = 1;
        }
      } else if (len === 0) {
        mapped = new Array(newLen);
        for (j = 0; j < newLen; j++) {
          items[j] = newItems[j];
          mapped[j] = createRoot(mapper);
        }
        len = newLen;
      } else {
        temp = new Array(newLen);
        tempdisposers = new Array(newLen);
        indexes && (tempIndexes = new Array(newLen));
        for (start = 0, end = Math.min(len, newLen); start < end && items[start] === newItems[start]; start++) ;
        for (end = len - 1, newEnd = newLen - 1; end >= start && newEnd >= start && items[end] === newItems[newEnd]; end--, newEnd--) {
          temp[newEnd] = mapped[end];
          tempdisposers[newEnd] = disposers[end];
          indexes && (tempIndexes[newEnd] = indexes[end]);
        }
        newIndices = /* @__PURE__ */ new Map();
        newIndicesNext = new Array(newEnd + 1);
        for (j = newEnd; j >= start; j--) {
          item = newItems[j];
          i = newIndices.get(item);
          newIndicesNext[j] = i === void 0 ? -1 : i;
          newIndices.set(item, j);
        }
        for (i = start; i <= end; i++) {
          item = items[i];
          j = newIndices.get(item);
          if (j !== void 0 && j !== -1) {
            temp[j] = mapped[i];
            tempdisposers[j] = disposers[i];
            indexes && (tempIndexes[j] = indexes[i]);
            j = newIndicesNext[j];
            newIndices.set(item, j);
          } else disposers[i]();
        }
        for (j = start; j < newLen; j++) {
          if (j in temp) {
            mapped[j] = temp[j];
            disposers[j] = tempdisposers[j];
            if (indexes) {
              indexes[j] = tempIndexes[j];
              indexes[j](j);
            }
          } else mapped[j] = createRoot(mapper);
        }
        mapped = mapped.slice(0, len = newLen);
        items = newItems.slice(0);
      }
      return mapped;
    });
    function mapper(disposer) {
      disposers[j] = disposer;
      if (indexes) {
        const [s, set] = createSignal(j);
        indexes[j] = set;
        return mapFn(newItems[j], s);
      }
      return mapFn(newItems[j]);
    }
  };
}
function createComponent$1(Comp, props) {
  return untrack(() => Comp(props || {}));
}
function trueFn() {
  return true;
}
const propTraps = {
  get(_, property, receiver) {
    if (property === $PROXY) return receiver;
    return _.get(property);
  },
  has(_, property) {
    if (property === $PROXY) return true;
    return _.has(property);
  },
  set: trueFn,
  deleteProperty: trueFn,
  getOwnPropertyDescriptor(_, property) {
    return {
      configurable: true,
      enumerable: true,
      get() {
        return _.get(property);
      },
      set: trueFn,
      deleteProperty: trueFn
    };
  },
  ownKeys(_) {
    return _.keys();
  }
};
function resolveSource(s) {
  return !(s = typeof s === "function" ? s() : s) ? {} : s;
}
function resolveSources() {
  for (let i = 0, length = this.length; i < length; ++i) {
    const v = this[i]();
    if (v !== void 0) return v;
  }
}
function mergeProps(...sources) {
  let proxy = false;
  for (let i = 0; i < sources.length; i++) {
    const s = sources[i];
    proxy = proxy || !!s && $PROXY in s;
    sources[i] = typeof s === "function" ? (proxy = true, createMemo(s)) : s;
  }
  if (SUPPORTS_PROXY && proxy) {
    return new Proxy(
      {
        get(property) {
          for (let i = sources.length - 1; i >= 0; i--) {
            const v = resolveSource(sources[i])[property];
            if (v !== void 0) return v;
          }
        },
        has(property) {
          for (let i = sources.length - 1; i >= 0; i--) {
            if (property in resolveSource(sources[i])) return true;
          }
          return false;
        },
        keys() {
          const keys = [];
          for (let i = 0; i < sources.length; i++)
            keys.push(...Object.keys(resolveSource(sources[i])));
          return [...new Set(keys)];
        }
      },
      propTraps
    );
  }
  const sourcesMap = {};
  const defined = /* @__PURE__ */ Object.create(null);
  for (let i = sources.length - 1; i >= 0; i--) {
    const source = sources[i];
    if (!source) continue;
    const sourceKeys = Object.getOwnPropertyNames(source);
    for (let i2 = sourceKeys.length - 1; i2 >= 0; i2--) {
      const key = sourceKeys[i2];
      if (key === "__proto__" || key === "constructor") continue;
      const desc = Object.getOwnPropertyDescriptor(source, key);
      if (!defined[key]) {
        defined[key] = desc.get ? {
          enumerable: true,
          configurable: true,
          get: resolveSources.bind(sourcesMap[key] = [desc.get.bind(source)])
        } : desc.value !== void 0 ? desc : void 0;
      } else {
        const sources2 = sourcesMap[key];
        if (sources2) {
          if (desc.get) sources2.push(desc.get.bind(source));
          else if (desc.value !== void 0) sources2.push(() => desc.value);
        }
      }
    }
  }
  const target = {};
  const definedKeys = Object.keys(defined);
  for (let i = definedKeys.length - 1; i >= 0; i--) {
    const key = definedKeys[i], desc = defined[key];
    if (desc && desc.get) Object.defineProperty(target, key, desc);
    else target[key] = desc ? desc.value : void 0;
  }
  return target;
}
const narrowedError = (name) => `Stale read from <${name}>.`;
function For(props) {
  const fallback = "fallback" in props && {
    fallback: () => props.fallback
  };
  return createMemo(mapArray(() => props.each, props.children, fallback || void 0));
}
function Switch(props) {
  let keyed = false;
  const equals = (a, b) => (keyed ? a[1] === b[1] : !a[1] === !b[1]) && a[2] === b[2];
  const conditions = children(() => props.children), evalConditions = createMemo(
    () => {
      let conds = conditions();
      if (!Array.isArray(conds)) conds = [conds];
      for (let i = 0; i < conds.length; i++) {
        const c = conds[i].when;
        if (c) {
          keyed = !!conds[i].keyed;
          return [i, c, conds[i]];
        }
      }
      return [-1];
    },
    void 0,
    {
      equals
    }
  );
  return createMemo(
    () => {
      const [index, when, cond] = evalConditions();
      if (index < 0) return props.fallback;
      const c = cond.children;
      const fn = typeof c === "function" && c.length > 0;
      return fn ? untrack(
        () => c(
          keyed ? when : () => {
            if (untrack(evalConditions)[0] !== index) throw narrowedError("Match");
            return cond.when;
          }
        )
      ) : c;
    },
    void 0,
    void 0
  );
}
function Match(props) {
  return props;
}
function createRenderer$1({
  createElement: createElement2,
  createTextNode,
  isTextNode: isTextNode2,
  replaceText,
  insertNode: insertNode2,
  removeNode,
  setProperty,
  getParentNode,
  getFirstChild,
  getNextSibling
}) {
  function insert2(parent, accessor, marker, initial) {
    if (marker !== void 0 && !initial) initial = [];
    if (typeof accessor !== "function") return insertExpression(parent, accessor, initial, marker);
    createRenderEffect((current) => insertExpression(parent, accessor(), current, marker), initial);
  }
  function insertExpression(parent, value, current, marker, unwrapArray) {
    while (typeof current === "function") current = current();
    if (value === current) return current;
    const t = typeof value, multi = marker !== void 0;
    if (t === "string" || t === "number") {
      if (t === "number") value = value.toString();
      if (multi) {
        let node = current[0];
        if (node && isTextNode2(node)) {
          replaceText(node, value);
        } else node = createTextNode(value);
        current = cleanChildren(parent, current, marker, node);
      } else {
        if (current !== "" && typeof current === "string") {
          replaceText(getFirstChild(parent), current = value);
        } else {
          cleanChildren(parent, current, marker, createTextNode(value));
          current = value;
        }
      }
    } else if (value == null || t === "boolean") {
      current = cleanChildren(parent, current, marker);
    } else if (t === "function") {
      createRenderEffect(() => {
        let v = value();
        while (typeof v === "function") v = v();
        current = insertExpression(parent, v, current, marker);
      });
      return () => current;
    } else if (Array.isArray(value)) {
      const array = [];
      if (normalizeIncomingArray(array, value, unwrapArray)) {
        createRenderEffect(
          () => current = insertExpression(parent, array, current, marker, true)
        );
        return () => current;
      }
      if (array.length === 0) {
        const replacement = cleanChildren(parent, current, marker);
        if (multi) return current = replacement;
      } else {
        if (Array.isArray(current)) {
          if (current.length === 0) {
            appendNodes(parent, array, marker);
          } else reconcileArrays(parent, current, array);
        } else if (current == null || current === "") {
          appendNodes(parent, array);
        } else {
          reconcileArrays(parent, multi && current || [getFirstChild(parent)], array);
        }
      }
      current = array;
    } else {
      if (Array.isArray(current)) {
        if (multi) return current = cleanChildren(parent, current, marker, value);
        cleanChildren(parent, current, null, value);
      } else if (current == null || current === "" || !getFirstChild(parent)) {
        insertNode2(parent, value);
      } else replaceNode(parent, value, getFirstChild(parent));
      current = value;
    }
    return current;
  }
  function normalizeIncomingArray(normalized, array, unwrap) {
    let dynamic = false;
    for (let i = 0, len = array.length; i < len; i++) {
      let item = array[i], t;
      if (item == null || item === true || item === false) ;
      else if (Array.isArray(item)) {
        dynamic = normalizeIncomingArray(normalized, item) || dynamic;
      } else if ((t = typeof item) === "string" || t === "number") {
        normalized.push(createTextNode(item));
      } else if (t === "function") {
        if (unwrap) {
          while (typeof item === "function") item = item();
          dynamic = normalizeIncomingArray(normalized, Array.isArray(item) ? item : [item]) || dynamic;
        } else {
          normalized.push(item);
          dynamic = true;
        }
      } else normalized.push(item);
    }
    return dynamic;
  }
  function reconcileArrays(parentNode, a, b) {
    let bLength = b.length, aEnd = a.length, bEnd = bLength, aStart = 0, bStart = 0, after = getNextSibling(a[aEnd - 1]), map = null;
    while (aStart < aEnd || bStart < bEnd) {
      if (a[aStart] === b[bStart]) {
        aStart++;
        bStart++;
        continue;
      }
      while (a[aEnd - 1] === b[bEnd - 1]) {
        aEnd--;
        bEnd--;
      }
      if (aEnd === aStart) {
        const node = bEnd < bLength ? bStart ? getNextSibling(b[bStart - 1]) : b[bEnd - bStart] : after;
        while (bStart < bEnd) insertNode2(parentNode, b[bStart++], node);
      } else if (bEnd === bStart) {
        while (aStart < aEnd) {
          if (!map || !map.has(a[aStart])) removeNode(parentNode, a[aStart]);
          aStart++;
        }
      } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
        const node = getNextSibling(a[--aEnd]);
        insertNode2(parentNode, b[bStart++], getNextSibling(a[aStart++]));
        insertNode2(parentNode, b[--bEnd], node);
        a[aEnd] = b[bEnd];
      } else {
        if (!map) {
          map = /* @__PURE__ */ new Map();
          let i = bStart;
          while (i < bEnd) map.set(b[i], i++);
        }
        const index = map.get(a[aStart]);
        if (index != null) {
          if (bStart < index && index < bEnd) {
            let i = aStart, sequence = 1, t;
            while (++i < aEnd && i < bEnd) {
              if ((t = map.get(a[i])) == null || t !== index + sequence) break;
              sequence++;
            }
            if (sequence > index - bStart) {
              const node = a[aStart];
              while (bStart < index) insertNode2(parentNode, b[bStart++], node);
            } else replaceNode(parentNode, b[bStart++], a[aStart++]);
          } else aStart++;
        } else removeNode(parentNode, a[aStart++]);
      }
    }
  }
  function cleanChildren(parent, current, marker, replacement) {
    if (marker === void 0) {
      let removed;
      while (removed = getFirstChild(parent)) removeNode(parent, removed);
      replacement && insertNode2(parent, replacement);
      return "";
    }
    const node = replacement || createTextNode("");
    if (current.length) {
      let inserted = false;
      for (let i = current.length - 1; i >= 0; i--) {
        const el = current[i];
        if (node !== el) {
          const isParent = getParentNode(el) === parent;
          if (!inserted && !i)
            isParent ? replaceNode(parent, node, el) : insertNode2(parent, node, marker);
          else isParent && removeNode(parent, el);
        } else inserted = true;
      }
    } else insertNode2(parent, node, marker);
    return [node];
  }
  function appendNodes(parent, array, marker) {
    for (let i = 0, len = array.length; i < len; i++) insertNode2(parent, array[i], marker);
  }
  function replaceNode(parent, newNode, oldNode) {
    insertNode2(parent, newNode, oldNode);
    removeNode(parent, oldNode);
  }
  function spreadExpression(node, props, prevProps = {}, skipChildren) {
    props || (props = {});
    if (!skipChildren) {
      createRenderEffect(
        () => prevProps.children = insertExpression(node, props.children, prevProps.children)
      );
    }
    createRenderEffect(() => props.ref && props.ref(node));
    createRenderEffect(() => {
      for (const prop in props) {
        if (prop === "children" || prop === "ref") continue;
        const value = props[prop];
        if (value === prevProps[prop]) continue;
        setProperty(node, prop, value, prevProps[prop]);
        prevProps[prop] = value;
      }
    });
    return prevProps;
  }
  return {
    render(code, element) {
      let disposer;
      createRoot((dispose2) => {
        disposer = dispose2;
        insert2(element, code());
      });
      return disposer;
    },
    insert: insert2,
    spread(node, accessor, skipChildren) {
      if (typeof accessor === "function") {
        createRenderEffect((current) => spreadExpression(node, accessor(), current, skipChildren));
      } else spreadExpression(node, accessor, void 0, skipChildren);
    },
    createElement: createElement2,
    createTextNode,
    insertNode: insertNode2,
    setProp(node, name, value, prev) {
      setProperty(node, name, value, prev);
      return value;
    },
    mergeProps,
    effect: createRenderEffect,
    memo: createMemo,
    createComponent: createComponent$1,
    use(fn, element, arg) {
      return untrack(() => fn(element, arg));
    }
  };
}
function createRenderer(options) {
  const renderer = createRenderer$1(options);
  renderer.mergeProps = mergeProps;
  return renderer;
}
const { render, effect, memo, createComponent, createElement, insertNode, insert, setProp } = createRenderer({
  createElement(type) {
    console.log(`[AsukaUI] createElement type=${type}`);
    assert(AsukaUI.instance != null);
    let core = AsukaUI.instance;
    let el = core.createNode(type);
    if (el === null)
      el = new AsukaUnknownNode();
    return el;
  },
  createTextNode(text) {
    assert(AsukaUI.instance != null);
    let core = AsukaUI.instance;
    return core.createTextNode(text);
  },
  replaceText(node, text) {
    if (isTextNode(node)) {
      node.data = text;
    }
  },
  insertNode(parent, node, anchor) {
    console.log(`[AsukaUI] insertNode parent=${parent.nodeName} node=${node.nodeName} anchor=${anchor == null ? void 0 : anchor.nodeName}`);
    parent.mountChild(node, anchor);
  },
  removeNode(parent, node) {
    console.log(`[AsukaUI] removeNode parent=${parent.nodeName} node=${node.nodeName}`);
    parent.unmountChild(node);
  },
  setProperty(node, name, value) {
    console.log(`[AsukaUI] setProperty node=${node.nodeName} name=${name} value=${value}`);
    node.setProperty(name, value);
  },
  isTextNode(node) {
    return isTextNode(node);
  },
  getParentNode(node) {
    let parent = node.parentNode;
    if (parent === null)
      parent = void 0;
    return parent;
  },
  getFirstChild(node) {
    let child = node.firstChild;
    if (child === null)
      child = void 0;
    return child;
  },
  getNextSibling(node) {
    let next = node.nextSibling;
    if (next === null)
      next = void 0;
    return next;
  }
});
var util = {
  isString: (x) => typeof x === "string",
  // 检查是否为字符串
  isObject: (x) => typeof x === "object"
  // 检查是否为对象
};
function isProtocolPath(path) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(path);
}
function extractProtocol(path) {
  const match = path.match(/^([a-zA-Z][a-zA-Z\d+\-.]*):\/\/(.*)$/);
  if (match) {
    return {
      protocol: match[1],
      // 获取协议
      filepath: match[2]
      // 获取文件路径
    };
  }
  return { protocol: null, filepath: path };
}
function normalizeArray(parts, allowAboveRoot) {
  var res = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    if (!p || p === ".") continue;
    if (p === "..") {
      if (res.length && res[res.length - 1] !== "..") {
        res.pop();
      } else if (allowAboveRoot) {
        res.push("..");
      }
    } else {
      res.push(p);
    }
  }
  return res;
}
function trimArray(arr) {
  var lastIndex = arr.length - 1;
  var start = 0;
  for (; start <= lastIndex; start++) {
    if (arr[start]) break;
  }
  var end = lastIndex;
  for (; end >= 0; end--) {
    if (arr[end]) break;
  }
  if (start === 0 && end === lastIndex) return arr;
  if (start > end) return [];
  return arr.slice(start, end + 1);
}
var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var posix = {};
function posixSplitPath(filename) {
  return splitPathRe.exec(filename).slice(1);
}
posix.resolve = function() {
  var resolvedPath = "", resolvedAbsolute = false;
  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = i >= 0 ? arguments[i] : process.cwd();
    if (!util.isString(path)) {
      throw new TypeError("Arguments to path.resolve must be strings");
    } else if (!path) {
      continue;
    }
    if (isProtocolPath(path)) {
      const { protocol, filepath } = extractProtocol(path);
      resolvedPath = filepath + "/" + resolvedPath;
      resolvedAbsolute = true;
    } else {
      resolvedPath = path + "/" + resolvedPath;
      resolvedAbsolute = path[0] === "/";
    }
  }
  resolvedPath = normalizeArray(
    resolvedPath.split("/"),
    !resolvedAbsolute
  ).join("/");
  return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
};
posix.normalize = function(path) {
  if (isProtocolPath(path)) {
    const { protocol, filepath } = extractProtocol(path);
    return protocol + "://" + normalizeArray(filepath.split("/")).join("/");
  }
  var isAbsolute = posix.isAbsolute(path), trailingSlash = path && path[path.length - 1] === "/";
  path = normalizeArray(path.split("/"), !isAbsolute).join("/");
  if (!path && !isAbsolute) {
    path = ".";
  }
  if (path && trailingSlash) {
    path += "/";
  }
  return (isAbsolute ? "/" : "") + path;
};
posix.isAbsolute = function(path) {
  return path.charAt(0) === "/";
};
posix.join = function() {
  var path = "";
  for (var i = 0; i < arguments.length; i++) {
    var segment = arguments[i];
    if (!util.isString(segment)) {
      throw new TypeError("Arguments to path.join must be strings");
    }
    if (segment) {
      if (!path) {
        path += segment;
      } else {
        path += "/" + segment;
      }
    }
  }
  return posix.normalize(path);
};
posix.relative = function(from, to) {
  from = posix.resolve(from).substr(1);
  to = posix.resolve(to).substr(1);
  var fromParts = trimArray(from.split("/"));
  var toParts = trimArray(to.split("/"));
  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }
  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push("..");
  }
  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join("/");
};
posix.dirname = function(path) {
  var result = posixSplitPath(path), root = result[0], dir = result[1];
  if (!root && !dir) {
    return ".";
  }
  if (dir) {
    dir = dir.substr(0, dir.length - 1);
  }
  return root + dir;
};
posix.basename = function(path, ext) {
  var f = posixSplitPath(path)[2];
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};
posix.extname = function(path) {
  return posixSplitPath(path)[3];
};
posix.format = function(pathObject) {
  if (!util.isObject(pathObject)) {
    throw new TypeError(
      "Parameter 'pathObject' must be an object, not " + typeof pathObject
    );
  }
  var root = pathObject.root || "";
  if (!util.isString(root)) {
    throw new TypeError(
      "'pathObject.root' must be a string or undefined, not " + typeof pathObject.root
    );
  }
  var dir = pathObject.dir ? pathObject.dir + posix.sep : "";
  var base = pathObject.base || "";
  return dir + base;
};
posix.parse = function(pathString) {
  if (!util.isString(pathString)) {
    throw new TypeError(
      "Parameter 'pathString' must be a string, not " + typeof pathString
    );
  }
  var allParts = posixSplitPath(pathString);
  if (!allParts || allParts.length !== 4) {
    throw new TypeError("Invalid path '" + pathString + "'");
  }
  allParts[1] = allParts[1] || "";
  allParts[2] = allParts[2] || "";
  allParts[3] = allParts[3] || "";
  return {
    root: allParts[0],
    dir: allParts[0] + allParts[1].slice(0, -1),
    base: allParts[2],
    ext: allParts[3],
    name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
  };
};
posix.sep = "/";
posix.delimiter = ":";
const head_magic = Uint8Array.from(
  "HZENGINE-PACKAGE!",
  (ch) => ch.charCodeAt(0)
);
const head_version = Uint8Array.from([1, 0, 0]);
const info_version = "1.0.0";
function checkHzpk_v1(path) {
  if (!hmFS__default.statSync({ path }))
    return {
      isHzpk: false,
      error: "读取 hzpk 失败"
    };
  let code = hmFS__default.openSync({ path, flag: hmFS__default.O_RDONLY });
  if (code < 0) {
    return {
      isHzpk: false,
      error: "打开 hzpk 失败"
    };
  }
  let headLen = head_magic.length + head_version.length;
  let buffer = new ArrayBuffer(headLen);
  let buf_view = new Uint8Array(buffer);
  let len = hmFS__default.readSync({
    fd: code,
    buffer,
    options: { length: headLen }
  });
  if (len !== headLen) {
    hmFS__default.closeSync({ fd: code });
    return {
      isHzpk: false,
      error: `无效的 hzpk（头长度不匹配，应为 ${headLen}，实际为 ${len}，buffer：${buffer.toString()}）`
    };
  }
  let offset = 0;
  for (let i = 0; i < head_magic.length; i++) {
    if (buf_view[i + offset] !== head_magic[i]) {
      hmFS__default.closeSync({ fd: code });
      return {
        isHzpk: false,
        error: `无效的 hzpk（magic 不匹配, 位置 ${offset}, buffer[${i + offset}]=${buf_view[i + offset]}, head_magic[${i}]=${head_magic[i]}, 应为 ${Buffer.from(
          head_magic.buffer
        ).toString()}, 实际为 ${Buffer.from(
          buffer.slice(offset, offset + head_magic.length)
        ).toString()}）`
      };
    }
  }
  offset += head_magic.length;
  for (let i = 0; i < head_version.length; i++) {
    if (buf_view[i + offset] !== head_version[i]) {
      hmFS__default.closeSync({ fd: code });
      return {
        isHzpk: false,
        error: `不支持该版本的 hzpk`
      };
    }
  }
  offset += head_version.length;
  let info_len = readNumber(path, offset);
  offset += calcNumberBytes(info_len);
  let info_buf = new ArrayBuffer(info_len);
  len = hmFS__default.readSync({
    fd: code,
    buffer: info_buf,
    options: { position: offset, length: info_len }
  });
  if (len !== info_len) {
    hmFS__default.closeSync({ fd: code });
    return {
      isHzpk: false,
      error: "hzpk 包信息长度不完整"
    };
  }
  let info;
  try {
    info = JSON.parse(Buffer.from(info_buf).toString());
  } catch (error) {
    hmFS__default.closeSync({ fd: code });
    return {
      isHzpk: false,
      error: "hzpk 包信息解析失败"
    };
  }
  offset += info_len;
  if (info.version !== info_version) {
    hmFS__default.closeSync({ fd: code });
    return {
      isHzpk: false,
      error: "不支持该版本的 hzpk 信息"
    };
  }
  hmFS__default.closeSync({ fd: code });
  return {
    isHzpk: true,
    info,
    offset
  };
}
function unpackHzpk_v1({
  hzpk_path,
  target_dir,
  offset,
  files_info,
  onProgress
}) {
  var _a;
  if (((_a = hmFS__default.readdirSync({ path: target_dir })) == null ? void 0 : _a.length) > 0) {
    clearDir(target_dir);
  }
  if (hmFS__default.readdirSync({ path: target_dir }) == void 0) {
    hmFS__default.mkdirSync({ path: target_dir });
  }
  let code = hmFS__default.openSync({ path: hzpk_path, flag: hmFS__default.O_RDONLY });
  if (code < 0) {
    throw new Error("打开 hzpk 失败");
  }
  function traverseDir(files_info2, dir) {
    for (let file in files_info2) {
      let file_info = files_info2[file];
      if (file_info.isDirectory) {
        if (hmFS__default.readdirSync({ path: posix.join(dir, file) }) === void 0) {
          hmFS__default.mkdirSync({ path: posix.join(dir, file) });
        }
        traverseDir(file_info.files_info, posix.join(dir, file));
      } else {
        let file_path = posix.join(dir, file);
        let buffer = new ArrayBuffer(file_info.size);
        hmFS__default.readSync({
          fd: code,
          buffer,
          options: {
            position: offset + file_info.offset,
            length: file_info.size
          }
        });
        hmFS__default.writeFileSync({ path: file_path, data: buffer });
      }
    }
  }
  traverseDir(files_info, target_dir);
  hmFS__default.closeSync({ fd: code });
}
function readNumber(path, offset) {
  var _a;
  let code = hmFS__default.openSync({ path });
  let len = (_a = hmFS__default.statSync({ path })) == null ? void 0 : _a.size;
  if (code < 0 || len === void 0) {
    return -1;
  }
  let sum = 0;
  let buffer = new ArrayBuffer(1);
  let buf_view = new Uint8Array(buffer);
  for (let p = offset; ; p++) {
    if (p >= len) {
      hmFS__default.closeSync({ fd: code });
      return -2;
    }
    hmFS__default.readSync({ fd: code, buffer, options: { position: p, length: 1 } });
    sum += buf_view[0];
    if (buf_view[0] !== 255) break;
  }
  return sum;
}
function calcNumberBytes(number) {
  if (number < 0) throw Error("calc number bytes must be >= 0");
  return Math.floor(number / 255) + 1;
}
function isFileSync({ path }) {
  let code = hmFS__default.openSync({ path });
  if (code >= 0) {
    hmFS__default.closeSync({ fd: code });
    return true;
  } else {
    return false;
  }
}
function clearDir(target_path) {
  if (isFileSync({ path: target_path })) {
    hmFS__default.rmSync({ path: target_path });
  } else {
    for (let file of hmFS__default.readdirSync({ path: target_path })) {
      clearDir(posix.join(target_path, file));
    }
  }
}
const hzpk_list_path = "data://hzpk_list.json";
function getHzpkList() {
  let hzpk_list = [];
  if (!isFileSync({ path: hzpk_list_path })) {
    hmFS__default.writeFileSync({
      path: hzpk_list_path,
      data: JSON.stringify(hzpk_list)
    });
  } else {
    hzpk_list = JSON.parse(
      hmFS__default.readFileSync({ path: hzpk_list_path, options: { encoding: "utf8" } })
    );
  }
  return hzpk_list;
}
function addHzpk(hzpk) {
  let hzpk_list = getHzpkList();
  hzpk_list.unshift(hzpk);
  hmFS__default.writeFileSync({
    path: hzpk_list_path,
    data: JSON.stringify(hzpk_list)
  });
}
function removeHzpkByUuid(uuid) {
  let hzpk_list = getHzpkList();
  for (let i = 0; i < hzpk_list.length; i++) {
    if (hzpk_list[i].uuid === uuid) {
      let hzpk = hzpk_list.splice(i, 1)[0];
      clearDir(hzpk.dir);
      hmFS__default.writeFileSync({
        path: hzpk_list_path,
        data: JSON.stringify(hzpk_list),
        options: { encoding: "utf8" }
      });
      break;
    }
  }
}
export {
  For as F,
  Match as M,
  Switch as S,
  createElement as a,
  insert as b,
  createSignal as c,
  createComponent as d,
  effect as e,
  checkHzpk_v1 as f,
  getHzpkList as g,
  removeHzpkByUuid as h,
  insertNode as i,
  addHzpk as j,
  memo as m,
  posix as p,
  render as r,
  setProp as s,
  unpackHzpk_v1 as u
};
