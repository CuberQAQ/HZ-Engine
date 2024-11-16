import * as hmUI from '@zos/ui';
import hmUI__default from '@zos/ui';
import { getDeviceInfo } from '@zos/device';
import { log, px as px$2 } from '@zos/utils';
import hmFS from '@zos/fs';

const equalFn = (a, b) => a === b;
const $PROXY = Symbol("solid-proxy");
const SUPPORTS_PROXY = typeof Proxy === "function";
const $TRACK = Symbol("solid-track");
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
  const listener = Listener,
    owner = Owner,
    unowned = fn.length === 0,
    current = owner ,
    root = unowned ? UNOWNED : {
      owned: null,
      cleanups: null,
      context: current ? current.context : null,
      owner: current
    },
    updateFn = unowned ? fn : () => fn(() => untrack(() => cleanNode(root)));
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
    comparator: options.equals || undefined
  };
  const setter = value => {
    if (typeof value === "function") {
      value = value(s.value);
    }
    return writeSignal(s, value);
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
  c.comparator = options.equals || undefined;
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
  if (Owner === null) ;else if (Owner.cleanups === null) Owner.cleanups = [fn];else Owner.cleanups.push(fn);
  return fn;
}
function children(fn) {
  const children = createMemo(fn);
  const memo = createMemo(() => resolveChildren(children()));
  memo.toArray = () => {
    const c = memo();
    return Array.isArray(c) ? c : c != null ? [c] : [];
  };
  return memo;
}
function readSignal() {
  if (this.sources && (this.state)) {
    if ((this.state) === STALE) updateComputation(this);else {
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
            if (o.pure) Updates.push(o);else Effects.push(o);
            if (o.observers) markDownstream(o);
          }
          if (!TransitionRunning) o.state = STALE;
        }
        if (Updates.length > 10e5) {
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
  runComputation(node, node.value, time);
}
function runComputation(node, value, time) {
  let nextValue;
  const owner = Owner,
    listener = Listener;
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
    state: state,
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
  if (Owner === null) ;else if (Owner !== UNOWNED) {
    {
      if (!Owner.owned) Owner.owned = [c];else Owner.owned.push(c);
    }
  }
  return c;
}
function runTop(node) {
  if ((node.state) === 0) return;
  if ((node.state) === PENDING) return lookUpstream(node);
  if (node.suspense && untrack(node.suspense.inFallback)) return node.suspense.effects.push(node);
  const ancestors = [node];
  while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
    if (node.state) ancestors.push(node);
  }
  for (let i = ancestors.length - 1; i >= 0; i--) {
    node = ancestors[i];
    if ((node.state) === STALE) {
      updateComputation(node);
    } else if ((node.state) === PENDING) {
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
  if (Effects) wait = true;else Effects = [];
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
        if (source !== ignore && (!source.updatedAt || source.updatedAt < ExecCount)) runTop(source);
      } else if (state === PENDING) lookUpstream(source, ignore);
    }
  }
}
function markDownstream(node) {
  for (let i = 0; i < node.observers.length; i += 1) {
    const o = node.observers[i];
    if (!o.state) {
      o.state = PENDING;
      if (o.pure) Updates.push(o);else Effects.push(o);
      o.observers && markDownstream(o);
    }
  }
}
function cleanNode(node) {
  let i;
  if (node.sources) {
    while (node.sources.length) {
      const source = node.sources.pop(),
        index = node.sourceSlots.pop(),
        obs = source.observers;
      if (obs && obs.length) {
        const n = obs.pop(),
          s = source.observerSlots.pop();
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
function resolveChildren(children) {
  if (typeof children === "function" && !children.length) return resolveChildren(children());
  if (Array.isArray(children)) {
    const results = [];
    for (let i = 0; i < children.length; i++) {
      const result = resolveChildren(children[i]);
      Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
    }
    return results;
  }
  return children;
}
const FALLBACK = Symbol("fallback");
function dispose(d) {
  for (let i = 0; i < d.length; i++) d[i]();
}
function mapArray(list, mapFn, options = {}) {
  let items = [],
    mapped = [],
    disposers = [],
    len = 0,
    indexes = mapFn.length > 1 ? [] : null;
  onCleanup(() => dispose(disposers));
  return () => {
    let newItems = list() || [],
      newLen = newItems.length,
      i,
      j;
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
          mapped[0] = createRoot(disposer => {
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
        for (start = 0, end = Math.min(len, newLen); start < end && items[start] === newItems[start]; start++);
        for (end = len - 1, newEnd = newLen - 1; end >= start && newEnd >= start && items[end] === newItems[newEnd]; end--, newEnd--) {
          temp[newEnd] = mapped[end];
          tempdisposers[newEnd] = disposers[end];
          indexes && (tempIndexes[newEnd] = indexes[end]);
        }
        newIndices = new Map();
        newIndicesNext = new Array(newEnd + 1);
        for (j = newEnd; j >= start; j--) {
          item = newItems[j];
          i = newIndices.get(item);
          newIndicesNext[j] = i === undefined ? -1 : i;
          newIndices.set(item, j);
        }
        for (i = start; i <= end; i++) {
          item = items[i];
          j = newIndices.get(item);
          if (j !== undefined && j !== -1) {
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
    if (v !== undefined) return v;
  }
}
function mergeProps$1(...sources) {
  let proxy = false;
  for (let i = 0; i < sources.length; i++) {
    const s = sources[i];
    proxy = proxy || !!s && $PROXY in s;
    sources[i] = typeof s === "function" ? (proxy = true, createMemo(s)) : s;
  }
  if (SUPPORTS_PROXY && proxy) {
    return new Proxy({
      get(property) {
        for (let i = sources.length - 1; i >= 0; i--) {
          const v = resolveSource(sources[i])[property];
          if (v !== undefined) return v;
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
        for (let i = 0; i < sources.length; i++) keys.push(...Object.keys(resolveSource(sources[i])));
        return [...new Set(keys)];
      }
    }, propTraps);
  }
  const sourcesMap = {};
  const defined = Object.create(null);
  for (let i = sources.length - 1; i >= 0; i--) {
    const source = sources[i];
    if (!source) continue;
    const sourceKeys = Object.getOwnPropertyNames(source);
    for (let i = sourceKeys.length - 1; i >= 0; i--) {
      const key = sourceKeys[i];
      if (key === "__proto__" || key === "constructor") continue;
      const desc = Object.getOwnPropertyDescriptor(source, key);
      if (!defined[key]) {
        defined[key] = desc.get ? {
          enumerable: true,
          configurable: true,
          get: resolveSources.bind(sourcesMap[key] = [desc.get.bind(source)])
        } : desc.value !== undefined ? desc : undefined;
      } else {
        const sources = sourcesMap[key];
        if (sources) {
          if (desc.get) sources.push(desc.get.bind(source));else if (desc.value !== undefined) sources.push(() => desc.value);
        }
      }
    }
  }
  const target = {};
  const definedKeys = Object.keys(defined);
  for (let i = definedKeys.length - 1; i >= 0; i--) {
    const key = definedKeys[i],
      desc = defined[key];
    if (desc && desc.get) Object.defineProperty(target, key, desc);else target[key] = desc ? desc.value : undefined;
  }
  return target;
}
const narrowedError = name => `Stale read from <${name}>.`;
function For(props) {
  const fallback = "fallback" in props && {
    fallback: () => props.fallback
  };
  return createMemo(mapArray(() => props.each, props.children, fallback || undefined));
}
function Switch(props) {
  let keyed = false;
  const equals = (a, b) => (keyed ? a[1] === b[1] : !a[1] === !b[1]) && a[2] === b[2];
  const conditions = children(() => props.children),
    evalConditions = createMemo(() => {
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
    }, undefined, {
      equals
    });
  return createMemo(() => {
    const [index, when, cond] = evalConditions();
    if (index < 0) return props.fallback;
    const c = cond.children;
    const fn = typeof c === "function" && c.length > 0;
    return fn ? untrack(() => c(keyed ? when : () => {
      if (untrack(evalConditions)[0] !== index) throw narrowedError("Match");
      return cond.when;
    })) : c;
  }, undefined, undefined);
}
function Match(props) {
  return props;
}

function createRenderer$1({
  createElement,
  createTextNode,
  isTextNode,
  replaceText,
  insertNode,
  removeNode,
  setProperty,
  getParentNode,
  getFirstChild,
  getNextSibling
}) {
  function insert(parent, accessor, marker, initial) {
    if (marker !== undefined && !initial) initial = [];
    if (typeof accessor !== "function") return insertExpression(parent, accessor, initial, marker);
    createRenderEffect(current => insertExpression(parent, accessor(), current, marker), initial);
  }
  function insertExpression(parent, value, current, marker, unwrapArray) {
    while (typeof current === "function") current = current();
    if (value === current) return current;
    const t = typeof value,
      multi = marker !== undefined;
    if (t === "string" || t === "number") {
      if (t === "number") value = value.toString();
      if (multi) {
        let node = current[0];
        if (node && isTextNode(node)) {
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
        createRenderEffect(() => current = insertExpression(parent, array, current, marker, true));
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
        insertNode(parent, value);
      } else replaceNode(parent, value, getFirstChild(parent));
      current = value;
    }
    return current;
  }
  function normalizeIncomingArray(normalized, array, unwrap) {
    let dynamic = false;
    for (let i = 0, len = array.length; i < len; i++) {
      let item = array[i],
        t;
      if (item == null || item === true || item === false) ;else if (Array.isArray(item)) {
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
    let bLength = b.length,
      aEnd = a.length,
      bEnd = bLength,
      aStart = 0,
      bStart = 0,
      after = getNextSibling(a[aEnd - 1]),
      map = null;
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
        while (bStart < bEnd) insertNode(parentNode, b[bStart++], node);
      } else if (bEnd === bStart) {
        while (aStart < aEnd) {
          if (!map || !map.has(a[aStart])) removeNode(parentNode, a[aStart]);
          aStart++;
        }
      } else if (a[aStart] === b[bEnd - 1] && b[bStart] === a[aEnd - 1]) {
        const node = getNextSibling(a[--aEnd]);
        insertNode(parentNode, b[bStart++], getNextSibling(a[aStart++]));
        insertNode(parentNode, b[--bEnd], node);
        a[aEnd] = b[bEnd];
      } else {
        if (!map) {
          map = new Map();
          let i = bStart;
          while (i < bEnd) map.set(b[i], i++);
        }
        const index = map.get(a[aStart]);
        if (index != null) {
          if (bStart < index && index < bEnd) {
            let i = aStart,
              sequence = 1,
              t;
            while (++i < aEnd && i < bEnd) {
              if ((t = map.get(a[i])) == null || t !== index + sequence) break;
              sequence++;
            }
            if (sequence > index - bStart) {
              const node = a[aStart];
              while (bStart < index) insertNode(parentNode, b[bStart++], node);
            } else replaceNode(parentNode, b[bStart++], a[aStart++]);
          } else aStart++;
        } else removeNode(parentNode, a[aStart++]);
      }
    }
  }
  function cleanChildren(parent, current, marker, replacement) {
    if (marker === undefined) {
      let removed;
      while (removed = getFirstChild(parent)) removeNode(parent, removed);
      replacement && insertNode(parent, replacement);
      return "";
    }
    const node = replacement || createTextNode("");
    if (current.length) {
      let inserted = false;
      for (let i = current.length - 1; i >= 0; i--) {
        const el = current[i];
        if (node !== el) {
          const isParent = getParentNode(el) === parent;
          if (!inserted && !i) isParent ? replaceNode(parent, node, el) : insertNode(parent, node, marker);else isParent && removeNode(parent, el);
        } else inserted = true;
      }
    } else insertNode(parent, node, marker);
    return [node];
  }
  function appendNodes(parent, array, marker) {
    for (let i = 0, len = array.length; i < len; i++) insertNode(parent, array[i], marker);
  }
  function replaceNode(parent, newNode, oldNode) {
    insertNode(parent, newNode, oldNode);
    removeNode(parent, oldNode);
  }
  function spreadExpression(node, props, prevProps = {}, skipChildren) {
    props || (props = {});
    if (!skipChildren) {
      createRenderEffect(() => prevProps.children = insertExpression(node, props.children, prevProps.children));
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
      createRoot(dispose => {
        disposer = dispose;
        insert(element, code());
      });
      return disposer;
    },
    insert,
    spread(node, accessor, skipChildren) {
      if (typeof accessor === "function") {
        createRenderEffect(current => spreadExpression(node, accessor(), current, skipChildren));
      } else spreadExpression(node, accessor, undefined, skipChildren);
    },
    createElement,
    createTextNode,
    insertNode,
    setProp(node, name, value, prev) {
      setProperty(node, name, value, prev);
      return value;
    },
    mergeProps: mergeProps$1,
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
  renderer.mergeProps = mergeProps$1;
  return renderer;
}

/// <reference types="@zeppos/device-types" />
const hmLogger = log.getLogger('AsukaUI');
({
  log: hmLogger.log,
  warn: hmLogger.warn,
  error: hmLogger.error,
  info: hmLogger.info,
  debug: hmLogger.debug
});
/**
 * **断言**
 * @description
 * 用于检查某个表达式或函数的执行结果。如果为false，将抛出一个断言错误。
 * @param success
 */
function assert(success) {
  try {
    if (typeof success === 'function') success = success();
    if (!success) {
      throw Error('Assert Failed');
    }
  } catch (e) {
    reportError('Assert Failed', e);
  }
}
function reportError(extra, err) {
  console.log("Reporting Error...");
  // logger.error(`ERROR:message=${extra} err=${err}`);
  let bg = hmUI__default.createWidget(hmUI__default.widget.FILL_RECT, {
    x: 0,
    y: 0,
    w: px$1(480),
    h: px$1(480),
    color: 0xd05977
  });
  hmUI__default.createWidget(hmUI__default.widget.TEXT, {
    x: px$1(0),
    y: px$1(20),
    w: px$1(480),
    h: px$1(80),
    text: 'ERROR!',
    text_size: px$1(60),
    font: 'fonts/UbuntuMono-Bold.ttf',
    color: 0xfcfcfc,
    align_h: hmUI__default.align.CENTER_H,
    align_v: hmUI__default.align.CENTER_V
  });
  let y = px$1(100);
  y += showSubtitle(extra, y) + px$1(10);
  y += showSubtitle('Error Name', y) + px$1(5);
  y += showCode(err.name ?? 'No Name Founded', y) + px$1(10);
  y += showSubtitle('Error Message', y) + px$1(5);
  y += showCode(err.message ?? 'No Message Founded', y) + px$1(10);
  y += showSubtitle('Error Stack', y) + px$1(5);
  y += showCode(err.stack ?? 'No Stack Founded', y) + px$1(10);
  bg.setProperty(hmUI__default.prop.MORE, {
    x: 0,
    y: 0,
    w: px$1(480),
    h: y + px$1(200)
  });
  throw err;
}
const px$1 = p => Number(px$2(p));
const SubTitleTextSize = px$1(36);
const SubTitleTextWidth = px$1(400);
function showSubtitle(text, offsetY) {
  let {
    width,
    height
  } = hmUI__default.getTextLayout(text, {
    text_size: px$1(42),
    text_width: SubTitleTextWidth,
    // font: "fonts/UbuntuMono-Regular.ttf",
    wrapped: 1
  });
  hmUI__default.createWidget(hmUI__default.widget.TEXT, {
    x: px$1(40),
    y: offsetY,
    w: px$1(400),
    h: height,
    text,
    text_size: SubTitleTextSize,
    text_style: hmUI__default.text_style.WRAP,
    font: 'fonts/UbuntuMono-Bold.ttf',
    color: 0xfcfcfc,
    // align_h: hmUI.align.CENTER_H,
    align_v: hmUI__default.align.BOTTOM
  });
  return height;
}
const CodeTextSize = px$1(30);
const CodeTextWidth = px$1(370);
function showCode(text, offsetY) {
  let {
    width,
    height
  } = hmUI__default.getTextLayout(text, {
    text_size: px$1(30),
    text_width: CodeTextWidth,
    // font: "fonts/UbuntuMono-Regular.ttf",
    wrapped: 1
  });
  if (height < px$1(45)) height = px$1(45);
  hmUI__default.createWidget(hmUI__default.widget.FILL_RECT, {
    x: px$1(40),
    y: offsetY,
    w: px$1(400),
    radius: px$1(8),
    h: height,
    color: 0x6f2641
  });
  hmUI__default.createWidget(hmUI__default.widget.TEXT, {
    x: px$1(55),
    y: offsetY,
    w: CodeTextWidth,
    h: height,
    text,
    text_size: CodeTextSize,
    text_style: hmUI__default.text_style.WRAP,
    font: 'fonts/UbuntuMono-Regular.ttf',
    color: 0xeeeeee,
    // align_h: hmUI.align.CENTER_H,
    align_v: hmUI__default.align.CENTER_V
  });
  return height;
}

function min(a, b) {
  return a <= b ? a : b;
}
function max(a, b) {
  return a >= b ? a : b;
}

// export interface ConstraintsData {
//   minHeight: number;
//   maxHeight: number;
//   minWidth: number;
//   maxWidth: number;
// }
/**
 * **布局约束类**
 * @description 布局约束，是指该节点的尺寸的允许范围。
 * 布局约束由`minHeight`，`maxHeight`，`minWidth`和`maxWidth`四个属性构成，详见`Constraints`
 *
 * 符合该约束的尺寸满足`minHeight <= height <= maxHeight`且`minWidth <= width <= maxWidth`.
 *
 * 当`minHeight == maxHeight`且`minWidth == maxWidth`时，称该约束为*严格约束*，意味着满足该约束的尺寸仅有一种.
 *
 * 当`minHeight == 0`且`minWidth == 0`时，该约束为*宽松约束*，意味着没有最小尺寸限制.
 *
 * **一个节点的最终尺寸必须符合其父节点传递的布局约束.**
 *
 * 框架保证所有`Constraints`类型的约束合理且有效，但请注意无穷大约束的处理。无穷大的尺寸将导致错误。
 *
 * @todo 处理`NaN`的情况
 */
class Constraints {
  minHeight;
  maxHeight;
  minWidth;
  maxWidth;
  constructor({
    minHeight = 0,
    maxHeight = Number.POSITIVE_INFINITY,
    minWidth = 0,
    maxWidth = Number.POSITIVE_INFINITY
  }) {
    if (isNaN(minHeight ?? NaN)) minHeight = 0;
    if (isNaN(minWidth ?? NaN)) minWidth = 0;
    if (isNaN(maxHeight ?? NaN)) maxHeight = 0;
    if (isNaN(maxWidth ?? NaN)) maxWidth = 0;
    if (minHeight < 0) minHeight = 0;
    if (minWidth < 0) minWidth = 0;
    if (maxHeight < minHeight) maxHeight = minHeight;
    if (maxWidth < minWidth) maxWidth = minWidth;
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
    this.minWidth = minWidth;
    this.maxWidth = maxWidth;
  }
  /**
   * **创建一个严格约束**
   * @description 给定一个`Size`对象，返回一个`Constraints`对象，
   * 使得满足该`Constraints`约束的`Size`仅有给定的`Size`一种
   * @param size
   * @returns
   */
  static createTight(size) {
    return new Constraints({
      minWidth: size.w,
      maxWidth: size.w,
      minHeight: size.h,
      maxHeight: size.h
    });
  }
  static isValid(constraints) {
    return constraints != null && !(isNaN(constraints.minHeight ?? NaN) || isNaN(constraints.minWidth ?? NaN) || isNaN(constraints.maxHeight ?? NaN) || isNaN(constraints.maxWidth ?? NaN)) && constraints.minHeight >= 0 && constraints.minWidth >= 0 && constraints.minHeight <= constraints.maxHeight && constraints.minWidth <= constraints.maxWidth;
  }
  static copy(constraints) {
    return new Constraints({
      minWidth: constraints.minWidth,
      maxWidth: constraints.maxWidth,
      minHeight: constraints.minHeight,
      maxHeight: constraints.maxHeight
    });
  }
  copy() {
    return new Constraints({
      minWidth: this.minWidth,
      maxWidth: this.maxWidth,
      minHeight: this.minHeight,
      maxHeight: this.maxHeight
    });
  }
  /**
   * 返回一个新的约束对象，使其在遵守原约束对象的同时尽可能向指定的长宽缩进
   * @param param0
   */
  tighten({
    width,
    height
  }) {
    let constraints = this.copy();
    if (width !== undefined) {
      if (width > this.minWidth) constraints.minWidth = min(width, this.maxWidth);
      if (width < this.maxWidth) constraints.maxWidth = max(width, this.minWidth);
    }
    if (height !== undefined) {
      if (height > this.minHeight) constraints.minHeight = min(height, this.maxHeight);
      if (height < this.maxHeight) constraints.maxHeight = max(height, this.minHeight);
    }
    return constraints;
  }
  /**
   * **约束操作**
   * @description
   * 将给定的Size对象以最小改动约束至该Constraints
   *
   * **将直接修改源对象**
   * @param size 需要约束的Size对象
   */
  constrain(size) {
    if (size.w < this.minWidth) size.w = this.minWidth;else if (size.w > this.maxWidth) size.w = this.maxWidth;
    if (size.h < this.minHeight) size.h = this.minHeight;else if (size.h > this.maxHeight) size.h = this.maxHeight;
    return size;
  }
  /**
   * **适应操作**
   * @description
   * 将该Constraints通过最小改动符合给定的Constraints
   *
   * **将直接修改源对象**
   * @param size 需要约束的Size对象
   */
  adoptBy(constrain) {
    assert(Constraints.isValid(constrain));
    if (this.minWidth < constrain.minWidth) this.minWidth = constrain.minWidth;else if (this.minWidth > constrain.maxWidth) this.minWidth = constrain.maxWidth;
    if (this.maxWidth > constrain.maxWidth) this.maxWidth = constrain.maxWidth;else if (this.maxWidth < constrain.minWidth) this.maxWidth = constrain.minWidth;
    if (this.minHeight < constrain.minHeight) this.minHeight = constrain.minHeight;else if (this.minHeight > constrain.maxHeight) this.minHeight = constrain.maxHeight;
    if (this.maxHeight > constrain.maxHeight) this.maxHeight = constrain.maxHeight;else if (this.maxHeight < constrain.minHeight) this.maxHeight = constrain.minHeight;
    return this;
  }
  /**
   * **宽松化**
   * @description
   * 将`minHeight`和`minWidth`的限制去除（设为0），返回一个新Constrains对象，不会改变原Constrains对象
   * @returns 宽松化后的Constrains对象
   */
  loose() {
    return new Constraints({
      maxHeight: this.maxHeight,
      maxWidth: this.maxWidth
    });
  }
  /**
   * **返回符合该约束的最大尺寸**
   */
  get biggest() {
    return {
      w: this.maxWidth,
      h: this.maxHeight
    };
  }
  /**
   * **返回符合该约束的最小尺寸**
   */
  get smallest() {
    return {
      w: this.minWidth,
      h: this.minHeight
    };
  }
  /**
   * **是否为严格约束**
   * @description
   * 即`minHeight`与`maxHeight`是否相等，且`minWidth`与`maxWidth`是否相等
   */
  get isTight() {
    return this.minHeight === this.maxHeight && this.minWidth === this.maxWidth;
  }
  /**
   * **判断两个Constrains对象是否相等**
   * @description
   * 当两个Constrains对象的`minHeight`、`maxHeight`、`minWidth`、`maxWidth`均相等时，返回true，否则为false
   * @param other 另一个Constrains对象
   * @returns 两个Constraints是否相等（当other参数为null时始终返回false）
   */
  equals(other) {
    return other != null && other.minHeight === this.minHeight && other.maxHeight === this.maxHeight && other.minWidth === this.minWidth && other.maxWidth === this.maxWidth;
  }
  toString() {
    return JSON.stringify({
      minWidth: this.minWidth,
      maxWidth: this.maxWidth,
      minHeight: this.minHeight,
      maxHeight: this.maxHeight
    });
  }
  /**
   * **检测一个`Size`对象是否符合本约束要求**
   * @param size 要检测的`Size`对象
   */
  testSize(size) {
    return size.h >= this.minHeight && size.h <= this.maxHeight && size.w >= this.minWidth && size.w <= this.maxWidth;
  }
}
class Size {
  static equals(size1, size2) {
    if (size1 == null && size2 == null) return true;else if (size1 == null || size2 == null) return false;
    return size1.w === size2.w && size1.h === size2.h;
  }
  static isValid(size) {
    // NaN>=0 -> false; 负无穷>=0 -> false; isFinite(正无穷) -> false.
    return size != null && size.h >= 0 && size.w >= 0 && isFinite(size.h) && isFinite(size.w);
  }
  /**
   * **判断一个`Size`对象是不是有穷的**
   * @param size 要判断的`Size`对象
   * @returns 是否有穷
   */
  static isFinite(size) {
    return Number.isFinite(size.w) && Number.isFinite(size.h);
  }
  static copy(size) {
    assert(size != null);
    return {
      ...size
    };
  }
  /**
   * **分别相加两个`Size`对象的长和宽，并返回一个新对象.**
   *
   * 注意
   * - 传递空值会报错，但没判断是否合法.
   * @param size1
   * @param size2
   * @returns 累加后的新对象
   */
  static add(size1, size2) {
    assert(size1 != null && size2 != null);
    return {
      w: size1.w + size2.w,
      h: size1.h + size2.h
    };
  }
  /**
   * **分别相减两个`Size`对象的长和宽，并返回一个新对象.**
   *
   * 注意
   * - 传递空值会报错，但没判断是否合法.
   * @param size1
   * @param size2
   * @returns 累加后的新对象
   */
  static remove(size1, size2) {
    assert(size1 != null && size2 != null);
    return {
      w: size1.w - size2.w,
      h: size1.h - size2.h
    };
  }
  static get infinite() {
    return {
      w: Number.POSITIVE_INFINITY,
      h: Number.POSITIVE_INFINITY
    };
  }
}
class Coordinate {
  static copy(coord) {
    assert(coord != null);
    return {
      ...coord
    };
  }
  static isValid(coord) {
    // isFinite(NaN) -> false
    return coord != null && isFinite(coord.x) && isFinite(coord.y);
  }
  static origin() {
    return {
      x: 0,
      y: 0
    };
  }
  static equals(coord1, coord2) {
    if (coord1 == null && coord2 == null) return true;else if (coord1 == null || coord2 == null) return false;
    return coord1.x === coord2.x && coord1.y === coord2.y;
  }
  /**
   * **分别相加两个`Coordinate`对象的`x`和`y`，并返回一个新对象.**
   *
   * 注意
   * - 传递空值会报错，但没判断是否合法.
   * @param coord1
   * @param coord2
   * @returns 累加后的新对象
   */
  static add(coord1, coord2) {
    assert(coord1 != null && coord2 != null);
    return {
      x: coord1.x + coord2.x,
      y: coord1.y + coord2.y
    };
  }
}
class Alignment {
  _x = 0;
  _y = 0;
  /**
   * **创建对齐**
   * @param x [-1.0,1.0] 当-1为最左 0为中 1为最右
   * @param y [-1.0,1.0] 当-1为最上 0为中 1为最下
   */
  constructor(x, y) {
    if (x) {
      this._x = min(max(x, -1.0), 1.0);
    }
    if (y) {
      this._y = min(max(y, -1.0), 1.0);
    }
  }
  /**
   * **创建对齐**
   * @param x [-1.0,1.0] 当-1为最左 0为中 1为最右
   * @param y [-1.0,1.0] 当-1为最上 0为中 1为最下
   */
  static create(x, y) {
    return new Alignment(x, y);
  }
  static get topLeft() {
    return new Alignment(-1.0, -1.0);
  }
  static get top() {
    return new Alignment(0.0, -1.0);
  }
  static get topRight() {
    return new Alignment(1.0, -1.0);
  }
  static get centerLeft() {
    return new Alignment(-1.0, 0.0);
  }
  static get center() {
    return new Alignment(0.0, 0.0);
  }
  static get centerRight() {
    return new Alignment(1.0, 0.0);
  }
  static get bottomLeft() {
    return new Alignment(-1.0, 1.0);
  }
  static get bottom() {
    return new Alignment(0.0, 1.0);
  }
  static get bottomRight() {
    return new Alignment(1.0, 1.0);
  }
  /**
   * **计算子偏移量**
   *
   * 根据两个尺寸（一个父一个子），计算子满足该`Alignment`对象时相对父的坐标坐标
   * @param parentSize 父尺寸
   * @param childSize 子尺寸
   * @returns 子相对父的偏移坐标
   * @todo 加上子大于父的判断
   */
  calcOffset(parentSize, childSize) {
    let emptySize = Size.remove(parentSize, childSize);
    return {
      x: emptySize.w / 2 * (1.0 + this._x),
      y: emptySize.h / 2 * (1.0 + this._y)
    };
  }
  static copy(alignment) {
    return new Alignment(alignment._x, alignment._y);
  }
}
/**
 * **轴向**
 */
var Axis;
(function (Axis) {
  /**
   * **水平**
   */
  Axis[Axis["horizontal"] = 0] = "horizontal";
  /**
   * **竖直**
   */
  Axis[Axis["vertical"] = 1] = "vertical";
})(Axis || (Axis = {}));
/**
 * 翻转轴向（水平变成垂直，垂直变成水平）
 * @param axis
 * @returns
 */
function flipAxis(axis) {
  return axis === Axis.horizontal ? Axis.vertical : Axis.horizontal;
}
/**
 * **主轴对齐方式**
 */
var MainAxisAlignment;
(function (MainAxisAlignment) {
  /**
   * **顶头**
   */
  MainAxisAlignment[MainAxisAlignment["start"] = 0] = "start";
  /**
   * **接尾**
   */
  MainAxisAlignment[MainAxisAlignment["end"] = 1] = "end";
  /**
   * **居中**
   */
  MainAxisAlignment[MainAxisAlignment["center"] = 2] = "center";
  /**
   * **顶头**接尾，其他均分
   */
  MainAxisAlignment[MainAxisAlignment["spaceBetween"] = 3] = "spaceBetween";
  /**
   * **中间**的孩子均分,两头的孩子空一半
   */
  MainAxisAlignment[MainAxisAlignment["spaceAround"] = 4] = "spaceAround";
  /**
   * **均匀**平分
   */
  MainAxisAlignment[MainAxisAlignment["spaceEvenly"] = 5] = "spaceEvenly";
})(MainAxisAlignment || (MainAxisAlignment = {}));
/**
 * **交叉对齐方式**
 */
var CrossAxisAlignment;
(function (CrossAxisAlignment) {
  /**
   * **顶头**
   */
  CrossAxisAlignment[CrossAxisAlignment["start"] = 0] = "start";
  /**
   * **接尾**
   */
  CrossAxisAlignment[CrossAxisAlignment["end"] = 1] = "end";
  /**
   * **居中**
   */
  CrossAxisAlignment[CrossAxisAlignment["center"] = 2] = "center";
  /**
   * **伸展**
   */
  CrossAxisAlignment[CrossAxisAlignment["stretch"] = 3] = "stretch";
  /**
   * **基线**
   */
  CrossAxisAlignment[CrossAxisAlignment["baseline"] = 4] = "baseline";
})(CrossAxisAlignment || (CrossAxisAlignment = {}));
/**
 * **主轴尺寸**
 */
var MainAxisSize;
(function (MainAxisSize) {
  /**
   * **尽可能小**
   */
  MainAxisSize[MainAxisSize["min"] = 0] = "min";
  /**
   * **尽可能大**
   */
  MainAxisSize[MainAxisSize["max"] = 1] = "max";
})(MainAxisSize || (MainAxisSize = {}));
/**
 * **水平排布方向**
 */
var HorizontalDirection;
(function (HorizontalDirection) {
  /**
   * **从左到右**
   */
  HorizontalDirection[HorizontalDirection["ltr"] = 0] = "ltr";
  /**
   * **从右到左**
   */
  HorizontalDirection[HorizontalDirection["rtl"] = 1] = "rtl";
})(HorizontalDirection || (HorizontalDirection = {}));
/**
 * **竖直排布方向**
 */
var VerticalDirection;
(function (VerticalDirection) {
  /**
   * **向上（从下到上）**
   */
  VerticalDirection[VerticalDirection["up"] = 0] = "up";
  /**
   * **向下（从上到下）**
   */
  VerticalDirection[VerticalDirection["down"] = 1] = "down";
})(VerticalDirection || (VerticalDirection = {}));
/**
 * **文字基线**
 */
var TextBaseline;
(function (TextBaseline) {
  TextBaseline[TextBaseline["alphabetic"] = 0] = "alphabetic";
  TextBaseline[TextBaseline["ideographic"] = 1] = "ideographic";
})(TextBaseline || (TextBaseline = {}));
/**
 * **Flexible组件的尺寸适应方式**
 */
var FlexFit;
(function (FlexFit) {
  /**
   * **强制子节点尺寸为可能的最大值**
   */
  FlexFit[FlexFit["tight"] = 0] = "tight";
  /**
   * **允许子节点尺寸在最大值以内自由选择**
   * @todo 这个到底是啥意思？
   */
  FlexFit[FlexFit["loose"] = 1] = "loose";
})(FlexFit || (FlexFit = {}));
/**
 * **边距**
 */
class EdgeInsets {
  _left;
  _up;
  _right;
  _down;
  constructor({
    left,
    up,
    right,
    down
  }) {
    this._left = left;
    this._up = up;
    this._right = right;
    this._down = down;
  }
  static all(value) {
    return new EdgeInsets({
      left: value,
      up: value,
      right: value,
      down: value
    });
  }
  static only(value) {
    return new EdgeInsets({
      left: value?.left ?? 0,
      up: value?.up ?? 0,
      right: value?.right ?? 0,
      down: value?.down ?? 0
    });
  }
  static symmetric({
    vertical,
    horizontal
  }) {
    return new EdgeInsets({
      left: horizontal ?? 0,
      up: vertical ?? 0,
      right: horizontal ?? 0,
      down: vertical ?? 0
    });
  }
  static get zero() {
    return EdgeInsets.only();
  }
  equals(e) {
    if (e == null) return false;
    return this._left === e._left && this._down === e._down && this._right === e._right && this._up === e._up;
  }
  get horizontalTotal() {
    return this._left + this._right;
  }
  get verticalTotal() {
    return this._up + this._down;
  }
  getInnerConstraints(outterConstraints) {
    return new Constraints({
      minWidth: outterConstraints.minWidth - this.horizontalTotal,
      maxWidth: outterConstraints.maxWidth - this.horizontalTotal,
      minHeight: outterConstraints.minHeight - this.verticalTotal,
      maxHeight: outterConstraints.maxHeight - this.verticalTotal
    });
  }
  /**
   * **获取仅包含padding占用空间的`Size`对象**
   */
  get totalSizeWithoutInner() {
    return {
      w: this.horizontalTotal,
      h: this.verticalTotal
    };
  }
  getOutterSize(innerSize) {
    return {
      w: innerSize.w + this.horizontalTotal,
      h: innerSize.h + this.verticalTotal
    };
  }
  get innerOffset() {
    return {
      x: this._left,
      y: this._up
    };
  }
}
var StackFit;
(function (StackFit) {
  /**
   * 将Stack的约束宽松后传给子组件
   */
  StackFit[StackFit["loose"] = 0] = "loose";
  /**
   * 将Stack的约束严格化后传给子组件
   */
  StackFit[StackFit["expand"] = 1] = "expand";
  /**
   * 将Stack的约束原样传递给子组件
   */
  StackFit[StackFit["passthrough"] = 2] = "passthrough";
})(StackFit || (StackFit = {}));

const NodeType = {
  TEXT_NODE: 1,
  RENDER_NODE: 2,
  UNKNOWN_NODE: 4
};
function isRenderNode(node) {
  return node === null ? false : node.nodeType === NodeType.RENDER_NODE;
}
function isTextNode(node) {
  return node === null ? false : node.nodeType === NodeType.TEXT_NODE;
}

/**
 * **向数组中插入或删除一个元素**
 * @description
 * 指定了`add`参数时，将`add`插入到数组`arr`中指定元素`ref`的前面；若未指定`add`，则从`arr`中删除元素`ref`
 * @param arr 操作的数组
 * @param ref 要删除的元素 或者 要插入元素的后面的元素
 * @param add 要插入的元素
 * @param byValueOnly 返回值为
 * @returns 操作失败时，返回`-1`；否则返回其在数组中对应的原索引
 */
function splice(arr, ref, add, byValueOnly) {
  let i = arr ? findWhere(arr, ref, true, byValueOnly) : -1;
  if (~i) arr.splice(i, 1); // TODO if i != -1
  return i;
}
/**
 * **从数组中查找指定的元素**
 * @param arr 操作的数组
 * @param ref 要查找的元素 或 一个判断元素是否为要查找元素的函数；
 * @param returnIndex 返回要查找的元素的数组索引还是元素本身
 * @param byValueOnly 当`ref`为函数时，将此项设为`true`以将`ref`视为数组元素而非查找函数
 * @returns 当`returnIndex`为true时，返回目标元素的数组索引，不存在则返回`-1`；当`returnIndex`为`false`时，返回目标元素本身，不存在则返回`undefined`
 */
function findWhere(arr, ref, returnIndex, byValueOnly) {
  let i = arr.length;
  while (i--) if (typeof ref !== 'function' || byValueOnly ? arr[i] === ref : ref(arr[i])) break;
  return returnIndex ? i : arr[i];
}

// import { AsukaLayoutNode } from "./asuka-layout";
// import { defineStyleReflection } from "./layout-bridge";
// import { splice, findWhere, createAttributeFilter, isElement } from "./util";
/**
 * **节点类**
 */
class AsukaNode {
  nodeType;
  nodeName;
  /** 父节点 */
  parentNode = null;
  /**
   * **父节点数据插槽**
   * @description
   * 用于存储父节点希望子节点存储的信息。
   *
   * 由于子模型无关、布局算法高度自定义等特点，出现父节点需要子节点存储数据的情况十分常见，故提供本插槽属性。
   * 将在`mountChild`时调用的`_setupMountingChild`中赋值为`{}`(空对象)进行初始化，并在`unmountChild`时调用的`_setupUnmounting`中赋值为`null`进行清除。
   * 其他任何时候，框架不会访问或改变它。
   *
   * 举例：多个采用双向链表存储子节点时诸如`nextSibling`，`previousSibling`等。
   */
  parentData;
  get nextSibling() {
    if (this.parentNode === null) return null;
    return this.parentNode.getChildNextSibling(this);
  }
  // /** 直接前继节点 */
  // public previousSibling: AsukaNode | null = null;
  // /** 直接后继节点 */
  // public nextSibling: AsukaNode | null = null;
  constructor(/** 节点类型 */
  nodeType, /** 节点名称 */
  nodeName) {
    this.nodeType = nodeType;
    this.nodeName = nodeName;
  }
  /**------------------属性设置------------------- */
  /**
   * **设置元素属性**
   * @param key 属性键
   * @param value 属性值
   */
  setProperty(key, value) {}
  setProperties(props) {
    for (const key in props) {
      this.setProperty(key, props[key]);
    }
  }
}
/**
 * **文字节点类**
 */
class AsukaTextNode extends AsukaNode {
  _text;
  constructor(text) {
    super(NodeType.TEXT_NODE, '#text'); // 3: TEXT_NODE
    this._text = text;
  }
  /**
   * 该文字节点保存的字符串
   */
  set data(text) {
    this._text = text;
  }
  get data() {
    return this._text;
  }
  get firstChild() {
    return null;
  }
  getChildNextSibling(child) {
    return null;
  }
  mountChild(child, ref) {
    return false;
  }
  unmountChild(child) {
    return false;
  }
}
/**
 * **未知节点类**
 */
class AsukaUnknownNode extends AsukaNode {
  constructor() {
    super(NodeType.UNKNOWN_NODE, '#unknown'); // 3: TEXT_NODE
  }
  get firstChild() {
    return null;
  }
  getChildNextSibling(child) {
    return null;
  }
  mountChild(child, ref) {
    return false;
  }
  unmountChild(child) {
    return false;
  }
}
/**
 * **可渲染节点**
 * @description
 * 涉及布局、绘制、事件都是可渲染节点
 */
class RenderNode extends AsukaNode {
  _handlers = {};
  // protected _attributes: {};
  constructor(nodeTyle, nodeName) {
    super(nodeTyle || NodeType.RENDER_NODE, nodeName); // 1: ELEMENT_NODE
  }
  /**------------------事件处理------------------- */
  /**
   * **添加事件处理器**
   * @param type 事件类型，不区分大小写
   * @param handler 事件处理函数
   */
  addEventListener(type, handler) {
    type = type.toLowerCase();
    (this._handlers[type] || (this._handlers[type] = [])).push(handler);
  }
  /**
   * **删除事件处理器**
   * @param type 事件类型，不区分大小写
   * @param handler 事件处理函数
   */
  removeEventListener(type, handler) {
    type = type.toLowerCase();
    splice(this._handlers[type], handler, undefined, true);
  }
  /**
   * **触发事件**
   * @description 如果要添加默认操作，请在调用本方法后判断`event.defaultPrevented`并决定是否执行默认操作
   * @param event 事件对象
   * @returns
   */
  dispatchEvent(event) {
    let target = event.target || (event.target = this),
      cancelable = event.cancelable,
      handlers,
      i;
    do {
      event.currentTarget = target;
      handlers = target._handlers && target._handlers[event.type];
      if (handlers)
        // 从后往前遍历事件处理函数
        for (i = handlers.length; i--;) {
          handlers[i].call(target, event);
          if (cancelable && event._end) break;
        }
    } while (event.bubbles && !(cancelable && event._stop) && (target = target.parentNode));
    return handlers != null;
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    if (key.startsWith('on')) {
      this.addEventListener(key.slice(2), value);
    }
  }
  /**------------------挂载操作------------------- */
  /**
   *  **当元素被挂载到Element树上**
   * @description
   * 即当被作为`mountChild()`的参数并成为子节点时调用。调用时parentNode已为新父元素。
   */
  onMount() {}
  /**
   *  **当元素被从Element树上取消挂载**
   * @description
   * 即当被作为`unmountChild()`的参数时调用。调用时parentNode已为null。
   */
  onUnmount() {}
  /**
   *  **当元素与`AsukaUI`连接（不再孤立）**
   * @description
   * 通常被`attach`调用
   */
  onAttach() {}
  /**
   *  **当元素不再与`AsukaUI`连接（变为孤立）**
   * @description
   * 通常被`detach`调用
   */
  onDetach() {}
  /**
   * **当元素所在树由孤立变为可渲染(即渲染树不与AsukaUI连接)**
   * @description
   * 该方法会通过`visitChildren`遍历所有的子`RenderNode`，并调用它们的`attach`方法、更新节点深度.
   *
   * 本方法需要传递attach调用给子节点以保证子节点`_attached`的正确性。
   *
   * 本方法还需要检测部分边界情况，并作处理。
   * - 当`_attached`为`false`时，也就是该节点未连接到一个可以允许子节点绘制的根节点上（也就是处于“孤立状态”），
   * 在此期间，若该节点的布局因为某些原因（比如回调事件或者布局相关的属性的变化）需要更新布局，由于处于孤立状态，本节点无法进行布局，
   * 更新布局的需求产生了对`markNeedsLayout`的调用，使`_needsLayout`为`true`，若该子节点的`_relayoutBoundary`不为`null`，
   * 则会一直调用`markParentNeedsLayout`直到到达重布局节点，但由于`_attached`为`false`，该节点无法向`AsukaUI`发出重布局请求。
   * 倘若该重布局节点并不是此孤立树的根节点，重新挂载后，由于`mountChild`仅调用挂载父节点的`markNeedsLayout`，
   * 而该重布局节点上方的节点不一定有重布局的需要(可能在其`layout`过程中因为`_needsLayout`为`false`且新传递的约束与之前相同而直接剪枝优化，
   * 而不向下传递`layout`调用)，因此可能导致该节点`_needsLayout`为`true`，却无法得到重新布局。
   * 所以当这种子节点被重新`attach`时，需要使其向`AsukaUI`发送布局请求。
   * - 当`_attached`为`false`时，由于某种原因产生对`markNeedsPlace`的调用类似. 不过`markNeedsPlace`不向上传递脏标记，因此思路较为简单
   */
  attach() {
    assert(!this._attached);
    assert(this.parentNode != null && this.parentNode._depth !== undefined);
    this._attached = true;
    // 重新计算节点的深度
    this._depth = this.parentNode._depth + 1;
    // 如果该节点在孤立状态时被上了布局脏标记（如果是`null`，`markParentNeedsLayout`的调用会传递至孤立树的根节点，
    // 保证沿途每个节点都被标记为脏，并在`mountChild`后得到向下传递的重布局调用）
    assert(() => {
      if (this._relayoutBoundary === null && this._needsLayout && this.parentNode !== null && isRenderNode(this.parentNode)) {
        assert(this.parentNode._needsLayout);
      }
      return true;
    });
    if (this._needsLayout && this._relayoutBoundary !== null) {
      // 重新布局脏标记，使其向`AsukaUI`发出布局请求
      this._needsLayout = false;
      this.markNeedsLayout();
    }
    if (this._needsPlace) {
      // 重新放置脏标记，使其向`AsukaUI`发出放置请求
      this._needsPlace = false;
      this.markNeedsPlace();
    }
    this.onAttach(); // 不能放在前面，否则重新放置脏标记的操作可能导致重复请求放置操作
    // this.markMustCommit();
    this.visitChildren(child => child.attach());
  }
  /**
   * **当元素所在树由可渲染变为孤立(即渲染树与AsukaUI连接)**
   * @description
   */
  detach() {
    assert(this._attached);
    this._attached = false;
    this.visitChildren(child => child.detach());
    // 为了让子组件deleteWidget时可能存在的父组件的widgetFactory还在，所以先visitChildren，再调用`onDetach`
    this.onDetach();
    // 注：没必要判断了。因为_core._layout可以判断你有没有_attached。就算你被移动改变了深度，排序也是_layout里面排的
    // // 如果该节点可能注册了重布局节点
    // if(this._relayoutBoundary === this && this._needsLayout) {
    //   assert(this._core != null)
    //   assert(findWhere(this._core!._nodesNeedsLayout, this, true) !== -1)
    //   this._core!.removeRelayoutNode(this)
    // }
    // assert(parent === null || this._attached === (this.parentNode as RenderNode)._attached)
  }
  /**
   * **初始化挂载的子节点**
   * @description
   * 用于挂载节点时设置子节点的插槽属性(parentNode和parentData)等，并将本节点布局标记为脏.
   *
   * **请在使用parentData和parentNode前调用**
   *
   * 通常被`mountChild`调用.
   *
   * @param child 要设置的子节点
   */
  _setupMountingChild(child) {
    child.parentNode = this;
    child.parentData = {};
    this.markNeedsLayout(); // 或许将该职责转移到`mountChild`上
    if (isRenderNode(child)) {
      // (child as RenderNode)._owner = this._owner;
      if (this._attached) child.attach(); // 在`markNeedsLayout`后调用（因为里面有断言）
      child.onMount();
      // (child as RenderNode)._cleanRelayoutBoundary();
    }
  }
  /**
   * **设置取消挂载的子节点**
   * @description
   * 用于取消挂载节点时设置子节点的插槽属性(parentNode和parentData)，并清除子树上即将失效(也就是指向本节点或者本节点的祖先)的`_relayoutBoundary`。
   *
   * **请在不使用parentData和parentNode时调用**
   *
   * 通常被`unmountChild`调用.
   *
   * @param child 要设置的子节点
   */
  _setupUnmountingChild(child) {
    child.parentNode = null;
    child.parentData = null;
    if (isRenderNode(child)) {
      child.onUnmount();
      if (this._attached) child.detach();
      // 清除子树上即将失效(也就是指向本节点或者本节点的祖先)的`_relayoutBoundary`
      child._cleanRelayoutBoundary();
    }
    this.markNeedsLayout(); // 或许将该职责转移到`unmountChild`上
  }
  // {
  //   if (ref) splice(this.childNodes, ref, child);
  //   else this.childNodes.push(child);
  //   this._setupChild(child)
  //   return child;
  // }
  /**------------------布局相关------------------- */
  /**
   * **需要布局(布局脏标记)**
   *
   * 框架应保证执行布局操作时，所有非孤立且拥有布局脏标记的节点的`layout`都被调用，并将脏标记清除，并且应迅速(在下一个JS事件循环时)
   * 若为孤立且拥有脏标记的节点，在转为非孤立状态后应立即请求布局，并在下一个JS事件循环时调用其`layout`，并清除脏标记。
   *
   * 框架保证，拥有脏标记的节点在`layout`过程中，其`performLayout`被调用（如果`sizedByParent`为`true`，还保证其`performResize`被调用）。
   * 通常，所有可能使布局发生变化的操作，都应当做布局脏标记(调用`markNeedsLayout`)
   */
  _needsLayout = false;
  /**
   * **需要确认最终位置(放置脏标记)**
   *
   * 框架应保证执行确认最终位置操作(简称放置操作)时，所有非孤立且拥有放置脏标记的节点的`place`都被调用，并将脏标记清除，并且应迅速(在下一个JS事件循环时)
   * 若为孤立且拥有脏标记的节点，在转为非孤立状态后应立即请求放置，并在下一个JS事件循环时调用其`place`，并清除脏标记。
   *
   * 框架保证，拥有脏标记的节点在`place`过程中，其`position`会得到更新，并根据情况执行`performCommit`操作.
   *
   * @see markNeedsPlace 更多有关`放置脏标记`的原理，请参见该方法
   */
  _needsPlace = false;
  /**
   * **必须执行推送操作(强制更新标记)**
   *
   * 框架应保证所有非孤立且拥有强制更新标记的节点的`performCommit`和`onCommit`都被调用，并将该标记清除，并且应迅速(在下一个JS事件循环时，`place`过程中)
   * 若为孤立且拥有脏标记的节点，在转为非孤立状态后应立即请求放置，并在下一个JS事件循环时的`place`时执行推送操作，并清除脏标记。
   */
  _mustCommit = false;
  /**
   * **本节点的深度**
   *
   * 定义`AsukaUI`的深度为`0`.
   *
   * 仅当`_attached`为`true`，即不为孤立节点时有效
   *
   * 主要用于在`AsukaUI`执行`layout`和`place`操作时确定先后顺序（深度小的节点先，深度大的节点后），保证不重复计算并正确.
   *
   * 在`attach`时更新
   */
  _depth = 0;
  /**
   * **本节点尺寸**
   *
   * 请勿直接修改本属性，而是通过`size`(getter/setter)修改或访问
   */
  _size = null;
  /**
   * **本节点尺寸是否已改变**
   *
   * 用途：
   * - 在`size`setter中判断并标记为`true`.
   * - 在`place`方法中用于判断是否需要执行`performCommit`操作，并将其标记为`false`
   */
  _sizeChanged = false;
  /**
   * **设置本节点尺寸**
   *
   * 会检查是否发生变化，如果变化了将自动调用`markNeedsPlace`，使位置得到更新，并自动按需调用`performCommit`.
   *
   * **请按照要求仅在`performResize`或`performLayout`中设置本属性，**其他情况，不应修改该属性，否则可能导致布局错误.
   *
   * 传递不合法的尺寸（负/无穷/NaN）或者`null`将导致错误
   *
   * 会拷贝一个新对象，不会直接使用传参的对象，调用者可以继续修改使用传递的`Size`对象
   */
  set size(size) {
    assert(() => {
      if (!Size.isValid(size)) {
        throw new Error(`Invalid size: ${JSON.stringify(size)}, at ${this.nodeName}, constraint: ${JSON.stringify(this._constraints)}`);
      }
      return true;
    });
    assert(size != null);
    if (!Size.equals(size, this._size)) {
      this.markNeedsPlace();
      // assert(this._sizeChanged === false)
      this._sizeChanged = true;
      this._size = Size.copy(size);
    }
  }
  /**
   * **获取本节点的尺寸**
   *
   * 返回`Size`类型的实例，或`null`
   */
  get size() {
    return this._size;
  }
  /**
   * **相对父节点的坐标偏移**
   *
   * 请勿直接修改本属性，而是通过`offset`(getter/setter)修改或访问
   */
  _offset = null;
  /**
   * **设置本节点相对父坐标的偏移**
   *
   * 会检查是否发生变化，如果变化了将自动调用`markNeedsPlace`，使位置得到更新，并自动按需调用`performCommit`.
   *
   * **请按照要求仅在`performLayout`中设置本属性，**其他情况，不应修改该属性，否则可能导致布局错误.
   *
   * 传递不合法的坐标或者`null`将导致错误
   *
   * 会拷贝一个新对象，不会直接使用传参的对象，调用者可以继续修改使用传递的`Coordinate`对象
   */
  set offset(offset) {
    assert(Coordinate.isValid(offset));
    if (offset == null) return;
    if (!Coordinate.equals(this._offset, offset)) {
      this._offset = Coordinate.copy(offset);
      this.markNeedsPlace();
    }
  }
  /**
   * **获取本节点相对相对父坐标的偏移**
   *
   * 返回`Coordinate`类型的实例，或`null`
   */
  get offset() {
    return this._offset;
  }
  /**
   * **该节点在当前坐标系的位置**
   *
   * 请勿直接修改本属性，而是通过`position`(getter/setter)修改或访问
   */
  _position = null;
  /**
   * **获取本节点在当前坐标系的位置**
   *
   * 返回`Coordinate`类型的实例，或`null`
   *
   * 所谓`当前坐标系`，是指像`hmUI`，`VIEW_CONTAINER`控件，`GROUP`控件上绘制本节点时，
   * 应当设置的坐标是相对于屏幕原点或者容器控件的位置而言的；`position`就是指正确布局时，在当前容器上绘制时应当设置的正确坐标
   *
   * 确认一个节点的位置，需要先在`layout`过程中确定其`offset`，
   * 并在`place`过程中，通过父节点的`position`(当然父节点为容器时不算这个)+该节点的`offset`，最终得出`position`
   */
  get position() {
    return this._position;
  }
  /**
   * **设置本节点相对父坐标的偏移**
   *
   * 仅应被`place`方法设置，请勿自行调用，**否则可能导致布局错误**，
   *
   * 传递不合法的坐标或者`null`将导致错误
   *
   * 会拷贝一个新对象，不会直接使用传参的对象，调用者可以继续修改使用传递的`Coordinate`对象.
   *
   * 内部不进行任何脏标记或`commit`操作，需要`place`方法实现.
   */
  set position(position) {
    assert(Coordinate.isValid(position));
    if (position == null) return;
    if (!Coordinate.equals(this._position, position)) {
      this._position = Coordinate.copy(position);
    }
  }
  /**
   * **局部重布局边界**
   * @description
   * 当子树添加脏标记时，重布局边界节点不会调用`markParentNeedsLayout`将脏标记传递给父节点；
   * 而是阻止向上传递，（非孤立时）向框架中心请求布局，并将自身加入待布局列表。
   *
   * 无论是否孤立，若`_relayoutBoundary`不为`null`，就应保证该属性指向的节点与本节点连通。
   *
   * 局部重布局边界需要保证其子树的布局发生变化时(不考虑挂载等非布局操作)，不会影响其父节点的布局结果，即父节点不需要重新布局。
   *
   * 具体而言，满足以下四种条件其一的节点，可作为为局部重布局边界。
   * 1. `sizedByParent == true` 由于布局过程从子节点传递到父节点的信息仅有子节点尺寸，且该节点的尺寸仅由父节点提供的布局约束有关，
   * 因此，该节点的子树的布局发生变化时，父节点的布局结果不变，可作为为局部重布局边界。
   * 2. `parentUsesSize == false` 父节点布局过程不计算和使用子节点尺寸，也就是子节点子树发生的任何布局变化即使令该子节点的尺寸发生变化，
   * 也不影响父节点的布局结果。
   * 3. `constraints.isTight` 父节点传递的布局约束为严格约束（最大和最小宽度相等且最大和最小高度相等，符合该约束的尺寸仅有一种），
   * 4. `!isRenderNode(this.parentNode)` 父节点不是可渲染节点，故布局只能从本节点开始。
   *
   */
  _relayoutBoundary = null;
  /**
   * **为子节点提供新的坐标系**
   * @description
   * 若为`false`, 子节点的`position`将等于其`offset`加上本节点的`position`；
   * 若为`true`，子节点的`position`将直接等于其`offset`（相当于本节点为子节点的坐标系原点）
   *
   * 用于如`ViewContainer`这样的为子节点提供了新的坐标参考系的组件中
   *
   * **请务必在对象初始化完成前确定，后续不应再修改**，若为`true`，
   *
   * 请考虑在`performLayout`中调用子节点的`layout`时传递为子节点提供的控件工厂(可能是`hmUI.widget.GROUP`或`VIEW_CONTAINER`之类的实例).
   */
  isNewCoordOrigin = false;
  /**
   * **上一次`layout`时获得的控件工厂**
   * @description
   * 所谓控件工厂，是指`hmUI`、`GROUP`实例或`VIEW_CONTAINER`实例等，拥有符合接口要求的`createWidget`和`deleteWidget`的方法的对象。
   * 请注意区分`hmUI`中的其他方法，控件工厂不一定都实现了这些方法。
   *
   * 在下一次`layout`或取消挂载或转为孤立树等发生前有效。
   */
  _widgetFactory = null;
  /**
   * **上一次`layout()`时获得的布局约束**
   * @description 布局约束，是指该节点的尺寸的允许范围。
   * 布局约束由`minHeight`，`maxHeight`，`minWidth`和`maxWidth`四个属性构成，详见`Constraints`
   *
   * 应仅当从未布局过时为`null`，其它任何时候都不得将该变量设置为空.
   */
  _constraints = null;
  /**
   * **渲染就绪状态**
   *
   * 即子节点是否被挂载在可渲染的树上（即根节点是否连接了AsukaUI）
   *
   * 仅当该属性为`true`时，才注册重新布局请求(即调用 `AsukaUI#addRelayoutNode` 或 `AsukaUI#requestRelayout` 方法)
   */
  _attached = false;
  /**
   * **框架中心**
   * @description
   * 提供处理布局、放置请求，处理基本默认事件，管理活动视图等核心任务。
   *
   * 仅当`this._attach`为`true`时，才允许调用其`AsukaUI#addRelayoutNode` 或 `AsukaUI#requestRelayout` 等方法
   *
   * 目前由AsukaUI创建节点时设置，不应自行修改)
   *
   */
  _core = null;
  /**
   * **布局尺寸仅由父节点传递的约束决定**
   * @description
   * 该节点的Size是否只与父节点传递的Constrains有关，而不与其它任何因素（如子节点的布局）有关。
   *
   * 换句话说，当父节点传递的布局约束不变时，本节点的子树无论发生产生何种布局变化，本节点的布局尺寸都不变，
   * 父节点就不需要重新布局（布局尺寸是父节点在布局时会参考子节点的唯一因素）
   *
   * 设置为`true`时，该节点将被标记为重布局边界(RelayoutBoundary)，其及其子节点产生的任何布局脏标记都不会传递给父节点，从而实现优化。
   * **如果为`true`，请在`performResize`中计算本节点的布局尺寸，不要在`performLayout`里做出任何计算或改变布局尺寸的操作。**
   *
   * 该属性由子类自行按需设置。
   * 除了对象初始化完成前，**请在改变本属性后调用`markSizedByParentChanged`，**保证布局结果得到正确更新。
   */
  sizedByParent = false;
  /**
   * **有条件地更新子树重布局边界**
   * @description
   * 当节点的_relayoutBoundary不是自己，且父节点的_relayoutBoundary与自己的不相等时，更新并传递给子节点
   */
  _propagateRelayoutBoundary() {
    // _relayoutBoundary 只有三种情况: this / 与父节点的原_relayoutBoundary一致 / null，如果是后两者，就更新
    if (this._relayoutBoundary === this) return;
    const parentRelayoutBoundary = this.parentNode._relayoutBoundary;
    if (parentRelayoutBoundary !== this._relayoutBoundary) {
      this._relayoutBoundary = parentRelayoutBoundary;
      this.visitChildren(child => {
        child._propagateRelayoutBoundary();
      });
    }
  }
  /**
   * **有条件地清空子树重布局边界**
   * @description
   * 若节点的_relayoutBoundary不是自己，则设为null，并传递给子节点
   */
  _cleanRelayoutBoundary() {
    if (this._relayoutBoundary !== this) {
      this._relayoutBoundary = null;
      this.visitChildren(child => child._cleanRelayoutBoundary());
    }
  }
  /**
   * **布局算法**
   * @param constraints 布局约束，要求该RenderNode的尺寸应符合该约束
   * @param parentUsesSize 父节点在 layout 时会不会使用当前节点的 size 信息(也就是当前节点的排版信息对父节点有无影响)；
   */
  layout(constraints, {
    parentUsesSize = false,
    widgetFactory
  }) {
    assert(widgetFactory != null && typeof widgetFactory.createWidget === 'function' && typeof widgetFactory.deleteWidget === 'function');
    assert((() => {
      if (!Constraints.isValid(constraints)) {
        throw new Error(`Invalid constraints: ${JSON.stringify(constraints)} \nFrom: [${this.nodeName}]${this.toString()}`);
      }
      return true;
    })());
    this._widgetFactory = widgetFactory;
    // 本节点是否为重布局边界（即布局脏标记是否会传递给本节点的父节点，并触发父节点重新布局）
    let isRelayoutBoundary = !parentUsesSize ||
    // 父节点不使用该节点的Size，也就是该节点的Size是固定的(到下次布局前)，所以该节点子树的布局变化不需要父节点重新布局
    this.sizedByParent ||
    // 该节点的Size只与父节点的Size有关，也就是该节点的子树布局变化不会影响该节点的Size，故不需要父节点重新布局
    constraints.isTight ||
    // 父节点传递了严格布局约束，也就是该节点的Size是固定的(到下次布局前)，那么该节点的子树布局变化不会使该节点的Size变化，故不需要父节点重新布局
    !isRenderNode(this.parentNode); // 父节点不是可渲染节点，子树的布局操作必须由该节点触发
    // 本次布局的重布局边界
    // 本节点的_relayoutBoundary由父节点在layout中设置
    let relayoutBoundary = isRelayoutBoundary ? this : this.parentNode._relayoutBoundary;
    // 如果该节点没有布局脏标记 且 上次布局的约束对象与本次的相等 （也就是本节点的子树无需重布局）
    if (!this._needsLayout && constraints.equals(this._constraints)) {
      // 更新子树的`relayoutBoundary`并立刻返回（剪枝优化）
      if (relayoutBoundary !== this._relayoutBoundary) {
        this._relayoutBoundary = relayoutBoundary;
        this.visitChildren(child => child._propagateRelayoutBoundary());
      }
      return;
    }
    this._constraints = constraints;
    // 若原来的`_relayoutBoundary`不为空（也就是上次挂载后已经布局过了，子渲染组件的也一定不为空），且RelayoutBoundary要变了
    if (this._relayoutBoundary !== null && relayoutBoundary !== this._relayoutBoundary) {
      // The local relayout boundary has changed, must notify children in case
      // they also need updating. Otherwise, they will be confused about what
      // their actual relayout boundary is later.
      this.visitChildren(child => child._cleanRelayoutBoundary());
    }
    this._relayoutBoundary = relayoutBoundary;
    if (this.sizedByParent) {
      this.performResize();
    }
    this.performLayout();
    // markNeedsSemanticsUpdate
    this._needsLayout = false;
  }
  /**
   * **在不重新确定尺寸的情况下重新布局**
   *
   * 不会检查`_needsLayout`，请调用前检查并决定是否剪枝
   */
  _layoutWithoutResize() {
    // TODO 检查是否有错
    assert(this._relayoutBoundary === this);
    assert(this.size != null);
    this.performLayout();
    this._needsLayout = false;
  }
  /**
   * **计算节点位置（放置操作）**
   * @description
   * 根据本节点的`offset`和父节点传递的`parentNewPosition`，计算本节点的`position`，并在需要时调用`performCommit`
   * @param parentNewPosition 父节点的新位置(未发生改变或者父节点`isNewCoordOrigin`就无需传参)
   */
  place(parentNewPosition) {
    // TODO 根节点的特殊处理
    assert(isRenderNode(this.parentNode));
    let parentNode = this.parentNode;
    assert(this._offset != null);
    assert(parentNode._position != null);
    if (!this._needsPlace && !parentNewPosition) return;
    this._needsPlace = false;
    let position = parentNewPosition ? Coordinate.add(parentNewPosition, this.offset) : parentNode.isNewCoordOrigin ? Coordinate.copy(this.offset) : Coordinate.add(this.offset, parentNode._position);
    // TODO copy和equals操作和setter重复了，是否可优化？
    let positionChanged = !Coordinate.equals(position, this._position);
    // TODO 检查并调试代码
    if (positionChanged) {
      this.position = position;
    }
    if (positionChanged || this._sizeChanged || this._mustCommit) {
      this._sizeChanged = this._mustCommit = false;
      this.performCommit();
    }
    if (positionChanged && !this.isNewCoordOrigin) {
      this.visitChildren(child => child.place(position));
    }
  }
  /**
   * **将该RenderNode标记为需要重新布局**
   */
  markNeedsLayout() {
    if (this._needsLayout) return;
    // 从未布局或者被取消挂载的时候自己的重布局边界不是自己
    if (this._relayoutBoundary === null) {
      this._needsLayout = true;
      // TODO 自加测试
      // assert(this.parentNode !== null);
      // _relayoutBoundary is cleaned by an ancestor in RenderObject.layout.
      // Conservatively mark everything dirty until it reaches the closest
      // known relayout boundary.
      if (this.parentNode !== null) this.markParentNeedsLayout();
      return;
    }
    if (this._relayoutBoundary !== this) {
      this.markParentNeedsLayout();
    } else {
      this._needsLayout = true;
      if (this._attached) {
        this._core.addRelayoutNode(this);
        this._core.requestRelayout();
      }
    }
  }
  /**
   * **将父节点标记为需要重新布局**
   */
  markParentNeedsLayout() {
    assert(this.parentNode !== null);
    this._needsLayout = true;
    this.parentNode.markNeedsLayout();
  }
  /**
   * **标记`sizedByParent`的修改**
   * @description
   * 当在初始化对象以后修改`sizedByParent`时，请调用本方法以确保布局正确更新.
   *
   * 该方法将本节点和父节点标记为脏布局，确保这两个节点的布局都能得到更新.
   */
  markSizedByParentChanged() {
    this.markNeedsLayout();
    this.markParentNeedsLayout();
  }
  /**
   * **标记需要重新计算节点位置（放置脏标记）**
   *
   * 通常不需要手动调用`markNeedsPlace`，因为通常只有当`offset`或父节点的位置可能发生变化时，本节点才需要重新确定位置，而前者只能由`layout`过程中计算，
   * 并在`performLayout`中赋值新的`offset`给子节点时，由子节点的`offset`setter 自动判断是否应调用`markNeedsPlace`;后者会在父节点的`place`方法中调用
   * 子节点的`place`，并不需要用到本脏标记. 另外一个调用来源是`markMustCommit`，因为其需要保证该节点的`place`得到调用，并在其中调用`performCommit`.
   *
   * @see markMustCommit 如果你想让框架保证`performCommit`或`onCommit`得到调用，请另见`markMustCommit`
   */
  markNeedsPlace() {
    // TODO 检查代码
    if (this._needsPlace) return;
    this._needsPlace = true;
    if (this._attached) {
      assert(this._core != null);
      this._core.addPlaceNode(this);
      this._core.requestPlace();
    }
    // TODO attached后再处理
  }
  markMustCommit() {
    if (this._mustCommit) return;
    this.markNeedsPlace();
  }
}
class RenderNodeWithNoChild extends RenderNode {
  get firstChild() {
    return null;
  }
  visitChildren(handler) {
    return;
  }
  unmountChild(child) {
    return false;
  }
  mountChild(child, ref) {
    return false;
  }
  getChildNextSibling(child) {
    return null;
  }
}
class RenderNodeWithSingleChild extends RenderNode {
  _child = null;
  set child(child) {
    if (this._child) {
      this.unmountChild(this._child);
      this._child = null;
    }
    if (child != null) this.mountChild(child);
  }
  get child() {
    return this._child;
  }
  get firstChild() {
    return this._child;
  }
  visitChildren(handler) {
    if (isRenderNode(this._child)) {
      handler(this._child);
    }
  }
  unmountChild(child) {
    if (this._child !== null && child === this._child) {
      this._setupUnmountingChild(child);
      this._child = null;
      return true;
    }
    return false;
  }
  mountChild(child) {
    if (this._child !== null) return false;
    this._child = child;
    this._setupMountingChild(child);
    return true;
  }
  getChildNextSibling(child) {
    return null;
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    if (key === 'child' && value instanceof AsukaNode) {
      this.child = value;
    }
  }
}
/**
 * **可包含多个子节点的RenderNode**
 *
 * 通过双向链表存储子结构
 */
class RenderNodeWithMultiChildren extends RenderNode {
  _firstChild = null;
  _lastChild = null;
  _childRenderNodeCount = 0;
  get firstChild() {
    return this._firstChild;
  }
  get childRenderNodeCount() {
    return this._childRenderNodeCount;
  }
  visitChildren(handler) {
    let nowChild = this._firstChild;
    while (nowChild) {
      if (isRenderNode(nowChild)) handler(nowChild);
      assert(nowChild.parentData.nextSibling !== undefined); // 为null或者AsukaNode
      nowChild = nowChild.parentData.nextSibling;
    }
  }
  unmountChild(child) {
    if (child.parentNode !== this) return false;
    let previousSibling = child.parentData.previousSibling;
    let nextSibling = child.parentData.nextSibling;
    if (previousSibling) previousSibling.parentData.nextSibling = nextSibling;
    if (nextSibling) nextSibling.parentData.previousSibling = previousSibling;
    if (child === this._firstChild) {
      this._firstChild = child.parentData.nextSibling;
    }
    if (child === this._lastChild) {
      this._lastChild = child.parentData.previousSibling;
    }
    this._setupUnmountingChild(child);
    if (isRenderNode(child)) --this._childRenderNodeCount;
    return true;
  }
  mountChild(child, ref) {
    assert(!child.parentNode);
    if (ref) {
      if (ref.parentNode !== this) return false;
      this._setupMountingChild(child);
      let previousSibling = ref.parentData.previousSibling;
      child.parentData.previousSibling = previousSibling;
      ref.parentData.previousSibling = child;
      if (previousSibling) previousSibling.parentData.nextSibling = child;
      child.parentData.nextSibling = ref;
      if (ref === this._firstChild) this._firstChild = child;
      if (isRenderNode(child)) ++this._childRenderNodeCount;
      return true;
    } else {
      this._setupMountingChild(child);
      let lastChild = this._lastChild;
      this._lastChild = child;
      child.parentData.previousSibling = lastChild;
      if (lastChild) lastChild.parentData.nextSibling = child;else this._firstChild = child;
      child.parentData.nextSibling = null;
      if (isRenderNode(child)) ++this._childRenderNodeCount;
      return true;
    }
  }
  getChildNextSibling(child) {
    return child.parentData.nextSibling;
  }
}
class RenderNodeProxy extends RenderNodeWithSingleChild {
  sizedByParent = false;
  performResize() {}
  performLayout() {
    assert(this._constraints != null);
    if (isRenderNode(this.child)) {
      assert(this._widgetFactory != null);
      let child = this.child;
      child.layout(this._constraints, {
        parentUsesSize: true,
        widgetFactory: this._widgetFactory
      });
      this.size = child.size;
      child.offset = {
        x: 0,
        y: 0
      };
    } else {
      this.size = this._constraints.smallest;
    }
  }
  performCommit() {}
}
/**
 * **事件类**
 * @description
 */
class AsukaEvent {
  type;
  bubbles;
  /** 触发事件的元素, 默认为调用`depatchEvent()`的元素 */
  target;
  /** 正在响应该事件的元素 */
  currentTarget;
  /** 该事件是否可取消 */
  cancelable;
  /** 该事件是否已被取消继续冒泡传播(当`cancelable`为`true`时有效) */
  _stop = false;
  /** 该事件是否已被立即取消继续传播(当`cancelable`为`true`时有效) */
  _end = false;
  /** 一个布尔值，表示 `preventDefault()` 方法是否取消了事件的默认行为。 */
  defaultPrevented = false; // TODO is false should be the default value?
  /**
   * **创建事件对象**
   * @param type 事件类型，不区分大小写
   * @param opts 事件属性
   * @property `opts.bubbles` 是否为冒泡类型
   * @property `opts.cancelable` 是否为可以取消
   */
  constructor(type, opts) {
    this.type = type;
    this.type = type.toLowerCase();
    this.bubbles = !!(opts && opts.bubbles);
    this.cancelable = !!(opts && opts.cancelable);
  }
  /**
   * **阻止冒泡事件向上传播**
   * @description
   * 它不能阻止附加到相同元素的相同事件类型的其他事件处理器。如果要阻止这些处理器的运行，请参见 `stopImmediatePropagation()` 方法。
   * （当`cancelable`为`true`时有效）
   */
  stopPropagation() {
    this._stop = true;
  }
  /**
   * **立即阻止事件传播**
   * @description
   * 如果多个事件监听器被附加到相同元素的相同事件类型上，当此事件触发时，它们会按其被添加的顺序被调用。
   * 如果在其中一个事件监听器中执行 `stopImmediatePropagation()` ，那么剩下的事件监听器都不会被调用。
   * 如果想只取消冒泡传播而继续执行相同元素剩下的事件监听器，请参见`stopPropagation()`方法。
   * （当`cancelable`为`true`时有效）
   */
  stopImmediatePropagation() {
    this._end = this._stop = true;
  }
  /** 阻止事件的默认行为 */
  preventDefault() {
    this.defaultPrevented = true;
  }
}
/**
 * **视图**
 * @description
 * Element树的根节点。获取一个hmUI控件工厂，并将其传递给子树。
 * 外界访问
 */
class RenderView extends RenderNodeWithSingleChild {
  #key;
  constructor({
    core,
    widgetFactory,
    size,
    key,
    offset = {
      x: 0,
      y: 0
    }
  }) {
    super(NodeType.RENDER_NODE, '#frame');
    this._widgetFactory = widgetFactory;
    this._depth = 1;
    this._size = Size.copy(size);
    this._offset = Coordinate.copy(offset);
    this._position = Coordinate.copy(offset);
    this._core = core;
    this.#key = key;
    this._attached = true;
    this._relayoutBoundary = this;
    // this.isNewCoordOrigin = true;
  }
  get key() {
    return this.#key;
  }
  /**
   * @override
   */
  set size(size) {
    assert(Size.isValid(size));
    if (size == null) return;
    if (!Size.equals(size, this._size)) {
      this._size = Size.copy(size);
      this.markNeedsLayout();
    }
  }
  get size() {
    return this._size; // getter 和 setter要同时重载...
  }
  setSize(size) {
    this.size = size;
    return this;
  }
  set offset(offset) {
    assert(Coordinate.isValid(offset));
    if (offset == null) return;
    if (!Coordinate.equals(this._offset, offset)) {
      this._offset = Coordinate.copy(offset);
      this._position = Coordinate.copy(offset);
      this.markNeedsPlace();
    }
  }
  setOffset(offset) {
    this.offset = offset;
    return this;
  }
  set position(position) {
    assert(Coordinate.isValid(position));
    if (position == null) return;
    if (!Coordinate.equals(this._position, position)) {
      this._offset = Coordinate.copy(position);
      this._position = Coordinate.copy(position);
      this.markNeedsPlace();
    }
  }
  setPosition(position) {
    this.position = position;
    return this;
  }
  place() {
    assert(this._offset != null);
    assert(this._position != null);
    if (!this._needsPlace) return;
    this._needsPlace = false;
    // }
    if (!this.isNewCoordOrigin) {
      this.visitChildren(child => child.place(this._position));
    }
  }
  performLayout() {
    assert(this._size != null);
    assert(this._widgetFactory != null);
    if (isRenderNode(this.child)) {
      let child = this.child;
      child.layout(Constraints.createTight(this._size), {
        parentUsesSize: false,
        widgetFactory: this._widgetFactory
      });
      child.offset = Coordinate.origin();
    }
  }
  performResize() {}
  performCommit() {}
}
class RenderWidget extends RenderNodeWithNoChild {
  _displaying = false;
  onAttach() {
    this.markMustCommit();
  }
  onDetach() {
    this._displaying = false;
    assert(this._widgetFactory !== null);
    this.onDestroy(this._widgetFactory);
  }
  performCommit() {
    assert(this.size !== null && this.position !== null && this._widgetFactory !== null);
    this.onCommit({
      size: this.size,
      position: this.position,
      initial: !this._displaying,
      widgetFactory: this._widgetFactory
    });
    this._displaying = true;
  }
}
/**
 *
 */
class RenderWidgetFactoryProvider extends RenderNodeWithSingleChild {
  _displaying = false;
  sizedByParent = false;
  childWidgetFactory = null;
  onAttach() {
    this.markMustCommit();
  }
  onDetach() {
    this._displaying = false;
    assert(this._widgetFactory !== null);
    this.onDestroy(this._widgetFactory);
  }
  performResize() {}
  /// 行为类似`RenderNodeProxy`，只不过替换了传给子控件的`widgetFactory`
  performLayout() {
    assert(this._constraints != null);
    if (isRenderNode(this.child)) {
      assert(this._widgetFactory != null);
      assert(this.childWidgetFactory != null);
      let child = this.child;
      child.layout(this._constraints, {
        parentUsesSize: true,
        widgetFactory: this.childWidgetFactory
      });
      this.size = child.size;
      child.offset = {
        x: 0,
        y: 0
      };
    } else {
      this.size = this._constraints.smallest;
    }
  }
  performCommit() {
    assert(this.size !== null && this.position !== null && this._widgetFactory !== null);
    this.onCommit({
      size: this.size,
      position: this.position,
      initial: !this._displaying,
      widgetFactory: this._widgetFactory
    });
    this._displaying = true;
  }
}
class AsukaUI {
  viewRecord = {};
  _activeFrame = null;
  _nodeFactories = [];
  static instance = null;
  constructor() {
    assert(AsukaUI.instance === null);
    AsukaUI.instance = this;
  }
  get activeFrame() {
    return this._activeFrame;
  }
  set activeFrame(frame) {
    // TODO
    this._activeFrame = frame;
  }
  mountView(mount = hmUI, options) {
    let size = options && options.size;
    let offset = options && options.offset || {
      x: 0,
      y: 0
    };
    if (!size) {
      if (mount === hmUI) {
        let {
          width,
          height
        } = getDeviceInfo();
        size = {
          w: width,
          h: height
        };
      } else {
        try {
          size = {
            w: mount.getProperty(hmUI.prop.W),
            h: mount.getProperty(hmUI.prop.H)
          };
        } catch {
          reportError('createFrame', Error('Get View size failed'));
        }
      }
    }
    if (!size) throw Error('Get View size failed');
    let view = new RenderView({
      widgetFactory: mount,
      core: this,
      size,
      key: Symbol('Asuka View'),
      offset
    });
    this.viewRecord[view.key] = view;
    return view;
  }
  unmountView(view) {
    if (!view._attached || !this.viewRecord[view.key]) return false;
    view.detach();
    this.viewRecord[view.key] = null;
    return true;
  }
  registerNodeFactory(nodeFactory) {
    this._nodeFactories.push(nodeFactory);
  }
  createNode(type) {
    let element = null;
    for (let nodeFactory of this._nodeFactories) {
      element = nodeFactory.createNode(type);
      if (element) break;
    }
    if (element !== null && isRenderNode(element)) {
      element._core = this;
    }
    return element;
  }
  createTextNode(text) {
    return new AsukaTextNode(text);
  }
  /** 需要重新布局的起始节点 */
  _nodesNeedsLayout = [];
  /** 需要重新放置的节点 */
  _nodesNeedsPlace = [];
  /** 在布局和放置任务完成后调用的任务 */
  _runAfterTasks = [];
  /** 异步管理器句柄(可能是setTimeout或者Promise之类的) */
  _asyncHandler = null;
  /**
   * **添加需要重新布局的节点**
   */
  addRelayoutNode(node) {
    assert(findWhere(this._nodesNeedsLayout, node, true) === -1);
    this._nodesNeedsLayout.push(node);
  }
  /**
   * **移除需要重新布局的节点**
   */
  removeRelayoutNode(node) {
    return splice(this._nodesNeedsLayout, node) !== -1;
  }
  /**
   * **请求重新布局**
   */
  requestRelayout() {
    if (this._asyncHandler === null) {
      this._asyncHandler = setTimeout(() => this._layoutAndPlace());
    }
  }
  /**
   * **添加需要重新布局的节点**
   */
  addPlaceNode(node) {
    assert(findWhere(this._nodesNeedsPlace, node, true) === -1);
    this._nodesNeedsPlace.push(node);
  }
  /**
   * **移除需要重新布局的节点**
   */
  removePlaceNode(node) {
    return splice(this._nodesNeedsPlace, node) !== -1;
  }
  /**
   * **请求重新布局**
   */
  requestPlace() {
    if (this._asyncHandler === null) {
      this._asyncHandler = setTimeout(() => this._layoutAndPlace());
    }
  }
  /**
   * **取消重新布局**
   */
  cancelRelayout() {
    if (this._asyncHandler !== null) clearTimeout(this._asyncHandler);
  }
  refreshSync() {
    if (this._asyncHandler !== null) {
      clearTimeout(this._asyncHandler);
      this._layoutAndPlace();
    }
  }
  /**
   * **添加布局与放置后的任务**
   *
   * 将在`layout`和`place`完成后调用，并清空任务队列
   * @param task 要执行的任务
   */
  addRunAfterAsync(task) {
    this._runAfterTasks.push(task);
  }
  /**
   * 重新布局时调用的
   */
  _layoutAndPlace() {
    // TODO
    this._asyncHandler = null;
    this._layout();
    this._place();
    this._runAfter();
  }
  _layout() {
    // TODO 检查
    // 按深度从小到大排序
    this._nodesNeedsLayout.sort((node1, node2) => node1._depth - node2._depth);
    for (let node of this._nodesNeedsLayout) {
      if (node._needsLayout && node._attached) node._layoutWithoutResize();
    }
    this._nodesNeedsLayout = [];
  }
  _place() {
    // TODO 检查
    this._nodesNeedsPlace.sort((node1, node2) => node1._depth - node2._depth);
    for (let node of this._nodesNeedsPlace) {
      if (node._needsPlace && node._attached) node.place();
    }
    this._nodesNeedsPlace = [];
  }
  _runAfter() {
    for (let task of this._runAfterTasks) {
      task();
    }
    this._runAfterTasks = [];
  }
}

class PreferSizeManager {
  _node;
  _preferredSize = null;
  constructor(_node) {
    this._node = _node;
  }
  _defaultSize = null;
  setDefaultSize(size) {
    this._defaultSize = size == null ? null : {
      ...size
    };
    let mixedSize = this._getMixedSize();
    if (!Size.equals(mixedSize, this._mixedSize)) {
      this._node.markNeedsLayout();
    }
    return this;
  }
  getDefaultSize() {
    return this._defaultSize;
  }
  _mixedSize = null;
  _getMixedSize() {
    return {
      w: this._preferredSize?.w ?? this._defaultSize?.w ?? Number.POSITIVE_INFINITY,
      h: this._preferredSize?.h ?? this._defaultSize?.h ?? Number.POSITIVE_INFINITY
    };
  }
  /**
   * **根据已有属性选择最合适的尺寸**
   *
   * 请在`performLayout`中调用，本方法会将变化后的结果修改至宿主的`size`
   */
  chooseSize() {
    assert(this._node._constraints != null);
    assert(Constraints.isValid(this._node._constraints));
    this._mixedSize = this._getMixedSize();
    // assert(()=>{
    //   if(this._mixedSize?.h == null || this._mixedSize?.w == null){
    //     throw new Error(`PreferSizeManager.chooseSize() error: ${this._mixedSize?.h} ${this._mixedSize?.w}, at ${this._node.nodeName}`)
    //   }
    //   return true
    // })
    this._node.size = this._node._constraints.constrain(this._mixedSize);
  }
  setProperty(key, value) {
    switch (key) {
      case 'w':
      case 'width':
        {
          let val = Number(value);
          if (!isNaN(val)) {
            val = max(val, 0);
            if (this._preferredSize === null || this._preferredSize.w !== val) {
              if (this._preferredSize === null) {
                this._preferredSize = {
                  w: null,
                  h: null
                };
              }
              this._preferredSize.w = val;
              this._node.markNeedsLayout();
            }
          }
        }
        break;
      case 'h':
      case 'height':
        {
          let val = Number(value);
          if (!isNaN(val)) {
            val = max(val, 0);
            if (this._preferredSize === null || this._preferredSize.h !== val) {
              if (this._preferredSize === null) {
                this._preferredSize = {
                  w: null,
                  h: null
                };
              }
              this._preferredSize.h = val;
              this._node.markNeedsLayout();
            }
          }
        }
        break;
    }
  }
}

const defaultProps$a = {
  color: 0xcc0000,
  line_width: 5
};
class NativeWidgetArc extends RenderWidget {
  _widget = null;
  _preferredSizeManager = new PreferSizeManager(this);
  _props = {
    ...defaultProps$a
  };
  sizedByParent = false;
  onCommit({
    size,
    position,
    widgetFactory,
    initial
  }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.ARC, {
        ...this._props,
        ...position,
        ...size
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
    assert(Constraints.isValid(this._constraints));
    this.size = this._constraints.biggest;
  }
  performLayout() {
    this._preferredSizeManager.chooseSize();
    // assert(()=>{throw Error("Test Point 2")})
  }
  setProperty(key, value) {
    this._preferredSizeManager.setProperty(key, value);
    switch (key) {
      case 'color':
        {
          this._props.color = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.COLOR, value);
        }
        break;
      case 's':
      case 'sa':
      case 'start':
      case 'start_angle':
        {
          this._props.start_angle = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.START_ANGLE, value);
        }
        break;
      case 'e':
      case 'ea':
      case 'end':
      case 'end_angle':
        {
          this._props.end_angle = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.END_ANGLE, value);
        }
        break;
      case 'lw':
      case 'line_width':
        {
          this._props.line_width = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.LINE_WIDTH, value);
        }
        break;
    }
  }
}

const defaultProps$9 = {
  text_size: px$2(36)
};
class NativeWidgetButton extends RenderWidget {
  _widget = null;
  _preferredSizeManager = new PreferSizeManager(this).setDefaultSize(Size.infinite);
  _props = {
    ...defaultProps$9
  };
  onCommit({
    size,
    position,
    widgetFactory,
    initial
  }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.BUTTON, {
        ...this._props,
        ...position,
        ...size,
        click_func: () => {
          this.dispatchEvent(new AsukaEvent('click', {
            bubbles: true,
            cancelable: true
          }));
        },
        longpress_func: () => {
          this.dispatchEvent(new AsukaEvent('longpress', {
            bubbles: true,
            cancelable: true
          }));
        }
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
    assert(Constraints.isValid(this._constraints));
    this.size = this._constraints.biggest;
  }
  performLayout() {
    this._preferredSizeManager.chooseSize();
    // assert(()=>{throw Error("Test Point 2")})
  }
  _updateDefaultSize() {
    if (this._props.normal_src) {
      let {
        width,
        height
      } = hmUI.getImageInfo(this._props.normal_src);
      this._preferredSizeManager.setDefaultSize({
        w: width,
        h: height
      });
    }
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    this._preferredSizeManager.setProperty(key, value);
    console.log(`set ${key} to ${value}`);
    switch (key) {
      case 'text':
        {
          if (this._props.text !== value) {
            this._props.text = value;
            if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
              ...this.size,
              ...this.position,
              text: value
            });
          }
        }
        break;
      case 'color':
        {
          if (this._props.color !== value) {
            this._props.color = value;
            if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
              ...this.size,
              ...this.position,
              color: value
            });
          }
        }
        break;
      case 'size':
      case 'ts':
      case 'text_size':
        {
          if (this._props.text_size !== value) {
            this._props.text_size = value;
            if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
              ...this.size,
              ...this.position,
              text_size: value
            });
          }
        }
        break;
      case 'nc':
      case 'ncolor':
      case 'normal_color':
        {
          if (this._props.normal_color !== value) {
            this._props.normal_color = value;
            if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
              ...this.size,
              ...this.position,
              normal_color: value
            });
          }
        }
        break;
      case 'pc':
      case 'pcolor':
      case 'press_color':
        {
          if (this._props.press_color !== value) {
            this._props.press_color = value;
            if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
              ...this.size,
              ...this.position,
              press_color: value
            });
          }
        }
        break;
      case 'r':
      case 'radius':
        {
          if (this._props.radius !== value) {
            this._props.radius = value;
            if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
              ...this.size,
              ...this.position,
              radius: value
            });
          }
        }
        break;
      case 'ns':
      case 'nsrc':
      case 'normal_src':
        {
          if (this._props.normal_src !== value) {
            this._props.normal_src = value;
            this._updateDefaultSize();
            if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
              ...this.size,
              ...this.position,
              normal_src: value
            });
          }
        }
        break;
      case 'ps':
      case 'psrc':
      case 'press_src':
        {
          if (this._props.press_src !== value) {
            this._props.press_src = value;
            if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
              ...this.size,
              ...this.position,
              press_src: value
            });
          }
        }
        break;
    }
  }
}

const defaultProps$8 = {};
class NativeWidgetCanvas extends RenderWidget {
  _widget = null;
  // _preferredSizeManager = new PreferSizeManager(this);
  _props = {
    ...defaultProps$8
  };
  sizedByParent = true;
  onCommit({
    size,
    position,
    widgetFactory,
    initial
  }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.CANVAS, {
        ...this._props,
        ...position,
        ...size
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
    assert(Constraints.isValid(this._constraints));
    this.size = this._constraints.biggest;
  }
  performLayout() {
    // this._preferredSizeManager.chooseSize();
    // assert(()=>{throw Error("Test Point 2")})
  }
  setProperty(key, value) {
    super.setProperty(key, value);
  }
}

const defaultProps$7 = {
  color: 0xff8888
};
class NativeWidgetCircle extends RenderWidget {
  _widget = null;
  _preferredSizeManager = new PreferSizeManager(this);
  _props = {
    ...defaultProps$7
  };
  sizedByParent = false;
  _fromSizeAndPositionToProp(size, position) {
    let radius = min(size.h, size.w) / 2;
    return {
      radius,
      center_x: position.x + size.w / 2 - radius,
      center_y: position.y + size.h / 2 - radius
    };
  }
  onCommit({
    size,
    position,
    widgetFactory,
    initial
  }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.FILL_RECT, {
        ...this._props,
        ...this._fromSizeAndPositionToProp(size, position)
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...this._fromSizeAndPositionToProp(size, position)
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
    assert(Constraints.isValid(this._constraints));
    this.size = this._constraints.biggest;
  }
  performLayout() {
    this._preferredSizeManager.chooseSize();
    // assert(()=>{throw Error("Test Point 2")})
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    this._preferredSizeManager.setProperty(key, value);
    switch (key) {
      case 'r':
      case 'radius':
        {
          this._preferredSizeManager.setDefaultSize({
            w: value,
            h: value
          });
        }
        break;
      case 'color':
        {
          this._props.color = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.COLOR, value);
        }
        break;
      case 'alpha':
        {
          this._props.alpha = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
            ...this.size,
            ...this.position,
            ...this._props
          });
        }
        break;
    }
  }
}

const defaultProps$6 = {
  color: 0xcc0000
};
class NativeWidgetFillRect extends RenderWidget {
  _widget = null;
  _preferredSizeManager = new PreferSizeManager(this);
  _props = {
    ...defaultProps$6
  };
  sizedByParent = false;
  onCommit({
    size,
    position,
    widgetFactory,
    initial
  }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.FILL_RECT, {
        ...this._props,
        ...position,
        ...size
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
    assert(Constraints.isValid(this._constraints));
    this.size = this._constraints.biggest;
  }
  performLayout() {
    this._preferredSizeManager.chooseSize();
    // assert(()=>{throw Error("Test Point 2")})
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    this._preferredSizeManager.setProperty(key, value);
    switch (key) {
      case 'r':
      case 'radius':
        {
          this._props.radius = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
            ...this.size,
            ...this.position,
            ...this._props
          });
        }
        break;
      case 'color':
        {
          this._props.color = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.COLOR, value);
        }
        break;
      case 'alpha':
        {
          this._props.alpha = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
            ...this.size,
            ...this.position,
            ...this._props
          });
        }
        break;
    }
  }
}

const defaultProps$5 = {};
class NativeWidgetImage extends RenderWidget {
  _widget = null;
  _props = {
    ...defaultProps$5
  };
  _preferredSizeManager = new PreferSizeManager(this);
  sizedByParent = false;
  onCommit({
    size,
    position,
    widgetFactory,
    initial
  }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.FILL_RECT, {
        ...this._props,
        ...position,
        ...size
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {}
  performLayout() {}
  _updateDefaultSize() {
    if (this._props.src) {
      let {
        width,
        height
      } = hmUI.getImageInfo(this._props.src);
      this._preferredSizeManager.setDefaultSize({
        w: width,
        h: height
      });
    }
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    this._preferredSizeManager.setProperty(key, value);
    switch (key) {
      case 'color':
        if (value !== this._props.color) {
          this._props.color = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.COLOR, value);
        }
        break;
      // case 'alpha':
      //   {
      //     if (value !== this._props.alpha) {
      //       this._props.alpha = value;
      //       if (this._widget)
      //         this._widget.setProperty(hmUI.prop.MORE, { ...this._props });
      //     }
      //   }
      //   break;
      case 'pos_x':
        {
          if (value !== this._props.pos_x) {
            this._props.pos_x = value;
            if (this._widget) this._widget.setProperty(hmUI.prop.POS_X, value);
          }
        }
        break;
      case 'pos_y':
        {
          if (value !== this._props.pos_y) {
            this._props.pos_y = value;
            if (this._widget) this._widget.setProperty(hmUI.prop.POS_Y, value);
          }
        }
        break;
      case 'angle':
        {
          if (value !== this._props.angle) {
            this._props.angle = value;
            if (this._widget) this._widget.setProperty(hmUI.prop.ANGLE, value);
          }
        }
        break;
      case 'center_x':
        {
          if (value !== this._props.center_x) {
            this._props.center_x = value;
            if (this._widget) this._widget.setProperty(hmUI.prop.CENTER_X, value);
          }
        }
        break;
      case 'center_y':
        {
          if (value !== this._props.center_y) {
            this._props.center_y = value;
            if (this._widget) this._widget.setProperty(hmUI.prop.CENTER_Y, value);
          }
        }
        break;
      case 'alpha':
        {
          if (value !== this._props.alpha) {
            this._props.alpha = value;
            if (this._widget) this._widget.setProperty(hmUI.prop.ALPHA, value);
          }
        }
        break;
      case 'auto_scale':
        {
          if (value !== this._props.auto_scale) {
            this._props.auto_scale = value;
            if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
              ...this._props
            });
          }
        }
        break;
      case 'auto_scale_obj_fit':
        {
          if (value !== this._props.auto_scale_obj_fit) {
            this._props.auto_scale_obj_fit = value;
            if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
              ...this._props
            });
          }
        }
        break;
      case 'src':
        {
          if (value !== this._props.src) {
            this._props.src = value;
            if (this._widget) this._widget.setProperty(hmUI.prop.SRC, value);
          }
        }
        break;
    }
  }
}

const defaultProps$4 = {};
class NativeWidgetPolyline extends RenderWidget {
  _widget = null;
  _preferredSizeManager = new PreferSizeManager(this);
  _props = {
    ...defaultProps$4
  };
  sizedByParent = false;
  onCommit({
    size,
    position,
    widgetFactory,
    initial
  }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.GRADKIENT_POLYLINE, {
        ...this._props,
        ...position,
        ...size
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
    assert(Constraints.isValid(this._constraints));
    this.size = this._constraints.biggest;
  }
  performLayout() {
    this._preferredSizeManager.chooseSize();
    // assert(()=>{throw Error("Test Point 2")})
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    this._preferredSizeManager.setProperty(key, value);
    switch (key) {
      case 'color':
      case 'line_color':
        {
          this._props.line_color = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.LINE_COLOR, value);
        }
        break;
      case 'lw':
      case 'line_width':
        {
          this._props.line_width = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.LINE_WIDTH, value);
        }
        break;
    }
  }
}

const defaultProps$3 = {
  content: 'null'
};
// Not support bg_x bg_y bg_w bg_h, please use container or stack etc to add background decoration.
class NativeWidgetQRCode extends RenderWidget {
  _widget = null;
  _preferredSizeManager = new PreferSizeManager(this);
  _props = {
    ...defaultProps$3
  };
  sizedByParent = false;
  onCommit({
    size,
    position,
    widgetFactory,
    initial
  }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.QRCODE, {
        ...this._props,
        ...position,
        ...size
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
    assert(Constraints.isValid(this._constraints));
    this.size = this._constraints.biggest;
  }
  performLayout() {
    this._preferredSizeManager.chooseSize();
    // assert(()=>{throw Error("Test Point 2")})
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    this._preferredSizeManager.setProperty(key, value);
    switch (key) {
      case 'content':
        {
          this._props.content = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
            ...this.position,
            ...this.size,
            content: value
          });
        }
        break;
    }
  }
}

const defaultProps$2 = {
  color: 0xcc0000
};
class NativeWidgetRadioGroup extends RenderWidgetFactoryProvider {
  _widget = null;
  _props = {
    ...defaultProps$2
  };
  _defaultChecked = 0;
  _registeredTask = null;
  _stateButtonWidget = [];
  _registerAfterAsyncTask() {
    assert(this._attached);
    assert(this._core != null);
    if (this._registeredTask !== null) {
      this._registeredTask = () => {
        this._registeredTask = null;
        assert(this._widget != null);
        if (this._stateButtonWidget.length > 0) {
          assert(this._defaultChecked < this._stateButtonWidget.length);
          this._widget.setProperty(hmUI.prop.INIT, this._stateButtonWidget[this._defaultChecked]);
        }
      };
      this._core.addRunAfterAsync(this._registeredTask);
    }
  }
  _initChildWidgetFactory() {
    this.childWidgetFactory = {
      createWidget: (widgetType, option) => {
        assert(this._widget != null);
        let widget = this._widget.createWidget(widgetType, option);
        if (widgetType === hmUI.widget.STATE_BUTTON) {
          this._stateButtonWidget.push(widget);
        }
      },
      deleteWidget: widget => {
        if (widget.getType() === hmUI.widget.STATE_BUTTON) {
          //   let index = findWhere(this._stateButtonWidget, widget, true);
          // TODO do some operations to make everything right
          splice(this._stateButtonWidget, widget);
        }
        assert(this._widget != null);
        this._widget.deleteWidget(widget);
      }
    };
  }
  onCommit({
    size,
    position,
    widgetFactory,
    initial
  }) {
    assert(this._props.select_src != null);
    assert(this._props.unselect_src != null);
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.FILL_RECT, {
        ...this._props,
        ...position,
        ...size
      });
      this._initChildWidgetFactory();
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  setProperty(key, value) {
    switch (key) {
      case 'select_src':
        {
          this._props.select_src = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
            ...this.size,
            ...this.position,
            ...this._props
          });
        }
        break;
      case 'unselect_src':
        {
          this._props.unselect_src = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
            ...this.size,
            ...this.position,
            ...this._props
          });
        }
        break;
    }
  }
}

const defaultProps$1 = {
  color: 0xcc4400
};
class NativeWidgetStrokeRect extends RenderWidget {
  _widget = null;
  _preferredSizeManager = new PreferSizeManager(this);
  _props = {
    ...defaultProps$1
  };
  sizedByParent = false;
  onCommit({
    size,
    position,
    widgetFactory,
    initial
  }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.STROKE_RECT, {
        ...this._props,
        ...position,
        ...size
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {
    assert(Constraints.isValid(this._constraints));
    this.size = this._constraints.biggest;
  }
  performLayout() {
    this._preferredSizeManager.chooseSize();
    // assert(()=>{throw Error("Test Point 2")})
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    this._preferredSizeManager.setProperty(key, value);
    switch (key) {
      case 'r':
      case 'radius':
        {
          this._props.radius = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
            ...this.size,
            ...this.position,
            ...this._props
          });
        }
        break;
      case 'color':
        {
          this._props.color = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.COLOR, value);
        }
        break;
      case 'angle':
        {
          this._props.angle = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.MORE, {
            ...this.size,
            ...this.position,
            ...this._props
          });
        }
        break;
      case 'lw':
      case 'line_width':
        {
          this._props.line_width = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.LINE_WIDTH, value);
        }
        break;
    }
  }
}

const defaultProps = {
  text: 'text',
  color: 0xffffff,
  text_size: Number(px$2(36)),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V
};
class NativeWidgetText extends RenderWidget {
  _widget = null;
  _props = {
    ...defaultProps
  };
  sizedByParent = false;
  onCommit({
    size,
    position,
    widgetFactory,
    initial
  }) {
    if (initial) {
      assert(this._widget === null);
      this._widget = widgetFactory.createWidget(hmUI.widget.TEXT, {
        ...this._props,
        ...position,
        ...size
      });
    } else {
      assert(this._widget != null);
      this._widget.setProperty(hmUI.prop.MORE, {
        ...this._props,
        ...position,
        ...size
      });
    }
  }
  onDestroy(widgetFactory) {
    assert(widgetFactory !== null && this._widget !== null);
    widgetFactory.deleteWidget(this._widget);
  }
  performResize() {}
  performLayout() {
    assert(Constraints.isValid(this._constraints));
    let {
      width: singleLineWidth,
      height: singleLineHeight
    } = hmUI.getTextLayout(this._props.text, {
      text_size: this._props.text_size,
      text_width: 0,
      wrapped: 0
    });
    if (this._props.text_style !== undefined && this._props.text_style === hmUI.text_style.WRAP) {
      // 文字可换行
      if (singleLineWidth > this._constraints.maxWidth) {
        // 换行
        let {
          width,
          height
        } = hmUI.getTextLayout(this._props.text, {
          text_size: this._props.text_size,
          text_width: this._constraints.maxWidth,
          wrapped: 1
        });
        this.size = this._constraints.constrain({
          w: width,
          h: height
        });
      } else {
        // 单行
        this.size = this._constraints.constrain({
          w: singleLineWidth,
          h: singleLineHeight
        });
      }
    } else {
      // 文字不可换行
      this.size = this._constraints.constrain({
        w: singleLineWidth,
        h: singleLineHeight
      });
    }
    // this.size = this._constraints!.maxSize();
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    switch (key) {
      case 'text':
        {
          this._props.text = '' + value;
          if (this._widget) {
            this._widget.setProperty(hmUI.prop.TEXT, '' + value);
          }
          this.markNeedsLayout();
        }
        break;
      case 'color':
        {
          this._props.color = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.COLOR, value);
        }
        break;
      case 'text_size':
        {
          this._props.text_size = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.TEXT_SIZE, value);
        }
        break;
      case 'text_style':
        {
          this._props.text_style = value;
          if (this._widget) this._widget.setProperty(hmUI.prop.TEXT_STYLE, value);
        }
        break;
    }
  }
}

const NativeBindingsFactory = {
  createNode(type) {
    switch (type) {
      case 'text':
        return new NativeWidgetText(null, type);
      case 'fill-rect':
      case 'fill_rect':
      case 'fillrect':
        return new NativeWidgetFillRect(null, type);
      case 'stroke-rect':
      case 'stroke_rect':
      case 'strokerect':
      case 'stroke':
        return new NativeWidgetStrokeRect(null, type);
      case 'image':
      case 'img':
        return new NativeWidgetImage(null, type);
      case 'button':
        return new NativeWidgetButton(null, type);
      case 'circle':
        return new NativeWidgetCircle(null, type);
      case 'arc':
        return new NativeWidgetArc(null, type);
      case 'qrcode':
        return new NativeWidgetQRCode(null, type);
      case 'polyline':
        return new NativeWidgetPolyline(null, type);
      case 'canvas':
        return new NativeWidgetCanvas(null, type);
      case 'radio':
      case 'radio_group':
      case 'radiogroup':
        return new NativeWidgetRadioGroup(null, type);
      default:
        return null;
    }
  }
};

class LayoutWidgetAlign extends RenderNodeWithSingleChild {
  sizedByParent = true;
  _align = Alignment.center;
  performResize() {
    assert(this._constraints != null);
    this.size = this._constraints.biggest;
  }
  performLayout() {
    assert(this.size != null);
    assert(this._widgetFactory != null);
    assert(this._constraints != null);
    if (isRenderNode(this.child)) {
      let child = this.child;
      child.layout(this._constraints.loose(), {
        parentUsesSize: true,
        widgetFactory: this._widgetFactory
      });
      assert(child.size != null);
      child.offset = this._align.calcOffset(this.size, child.size);
    }
  }
  performCommit() {}
  setProperty(key, value) {
    super.setProperty(key, value);
    switch (key) {
      case 'x':
        {
          let x = Number(value);
          if (x !== this._align._x) {
            this._align._x = x;
            this.markNeedsLayout();
          }
        }
        break;
      case 'y':
        {
          let y = Number(value);
          if (y !== this._align._y) {
            this._align._y = y;
            this.markNeedsLayout();
          }
        }
        break;
      case 'alignment':
        {
          if (!(value instanceof Alignment)) break;
          if (value._x !== this._align._x || value._y !== this._align._y) {
            this._align = Alignment.copy(value);
            this.markNeedsLayout();
          }
        }
        break;
    }
  }
}

class LayoutWidgetCenter extends RenderNodeWithSingleChild {
  sizedByParent = true;
  performResize() {
    assert(this._constraints != null);
    this.size = this._constraints.biggest;
  }
  performLayout() {
    assert(this.size != null);
    assert(this._widgetFactory != null);
    assert(this._constraints != null);
    if (isRenderNode(this.child)) {
      let child = this.child;
      child.layout(this._constraints.loose(), {
        parentUsesSize: true,
        widgetFactory: this._widgetFactory
      });
      assert(child.size != null);
      child.offset = {
        x: (this.size.w - child.size.w) / 2,
        y: (this.size.h - child.size.h) / 2
      };
    }
  }
  performCommit() {}
}

class LayoutWidgetFlex extends RenderNodeWithMultiChildren {
  _direction = Axis.vertical;
  _mainAxisAlignment = MainAxisAlignment.start;
  _mainAxisSize = MainAxisSize.max;
  _crossAxisAlignment = CrossAxisAlignment.center;
  _horizonDirection = HorizontalDirection.ltr;
  _verticalDirection = VerticalDirection.down;
  _textBaseline = null; // not support now
  _overflow = 0;
  sizedByParent = false;
  setProperty(key, value) {
    switch (key) {
      case 'd':
      case 'direction':
        {
          if (value !== this._direction) {
            this._direction = value;
            this.markNeedsLayout();
          }
        }
        break;
      case 'maa':
      case 'mainAxisAlignment':
        {
          if (value !== this._mainAxisAlignment) {
            this._mainAxisAlignment = value;
            this.markNeedsLayout();
          }
        }
        break;
      case 'mas':
      case 'mainAxisSize':
        {
          if (value !== this._mainAxisSize) {
            this._mainAxisSize = value;
            if (this._mainAxisSize === MainAxisSize.max) {
              this.sizedByParent = true;
              this.markSizedByParentChanged();
            } else {
              this.sizedByParent = false;
              this.markSizedByParentChanged();
            }
            this.markNeedsLayout();
          }
        }
        break;
      case 'caa':
      case 'crossAxisAlignment':
        {
          if (value !== this._crossAxisAlignment) {
            this._crossAxisAlignment = value;
            this.markNeedsLayout();
          }
        }
        break;
      case 'hd':
      case 'horizonDirection':
        {
          if (value !== this._horizonDirection) {
            this._horizonDirection = value;
            this.markNeedsLayout();
          }
        }
        break;
      case 'vd':
      case 'verticalDirection':
        {
          if (value !== this._verticalDirection) {
            this._verticalDirection = value;
            this.markNeedsLayout();
          }
        }
        break;
      case 'tb':
      case 'textBaseline':
        {
          if (value !== this._textBaseline) {
            this._textBaseline = value;
            this.markNeedsLayout();
          }
        }
        break;
    }
  }
  /**
   * sizedByParent == true，即_mainAxisSize == MainAxisSize.max时的布局
   *
   * 直接maxSize就完事儿了
   */
  performResize() {
    assert(this._constraints != null);
    this.size = this._constraints.biggest;
  }
  _getFlex(child) {
    return child instanceof LayoutWidgetFlexible ? child._flex : 0;
  }
  _getFit(child) {
    return child instanceof LayoutWidgetFlexible ? child._fit : FlexFit.tight;
  }
  _getMainSize(size) {
    return this._direction === Axis.horizontal ? size.w : size.h;
  }
  _getCrossSize(size) {
    return this._direction === Axis.horizontal ? size.h : size.w;
  }
  _startIsTopLeft(direction) {
    // If the relevant value of textDirection or verticalDirection is null, this returns null too.
    switch (direction) {
      case Axis.horizontal:
        switch (this._horizonDirection) {
          case HorizontalDirection.ltr:
            return true;
          case HorizontalDirection.rtl:
            return false;
          case null:
            return null;
        }
      case Axis.vertical:
        switch (this._verticalDirection) {
          case VerticalDirection.down:
            return true;
          case VerticalDirection.up:
            return false;
          case null:
            return null;
        }
    }
  }
  _computeSizes() {
    const constraints = this._constraints;
    let totalFlex = 0;
    const maxMainSize = this._direction === Axis.horizontal ? constraints.maxWidth : constraints.maxHeight;
    const canFlex = maxMainSize < Number.POSITIVE_INFINITY;
    let crossSize = 0;
    // Sum of the sizes of the non-flexible children
    let allocatedSize = 0;
    let lastFlexChild = null;
    // calculate children size, get crossSize and allcotedsSize
    this.visitChildren(child => {
      let flex = this._getFlex(child);
      if (flex > 0) {
        totalFlex += flex;
        lastFlexChild = child;
      } else {
        let innerConstraints;
        if (this._crossAxisAlignment === CrossAxisAlignment.stretch) {
          switch (this._direction) {
            case Axis.horizontal:
              innerConstraints = Constraints.createTight({
                h: constraints.maxHeight
              });
              break;
            case Axis.vertical:
              innerConstraints = Constraints.createTight({
                w: constraints.maxWidth
              });
              break;
          }
        } else {
          switch (this._direction) {
            case Axis.horizontal:
              innerConstraints = new Constraints({
                maxHeight: constraints.maxHeight
              });
              break;
            case Axis.vertical:
              innerConstraints = new Constraints({
                maxWidth: constraints.maxWidth
              });
              break;
          }
        }
        // layout child
        child.layout(innerConstraints, {
          parentUsesSize: true,
          widgetFactory: this._widgetFactory
        });
        assert(child.size != null);
        let childSize = child.size;
        allocatedSize += this._getMainSize(childSize);
        crossSize += max(crossSize, this._getCrossSize(childSize));
      }
    });
    // Distribute free space to flexible children
    let freeSpace = max(0, (canFlex ? maxMainSize : 0.0) - allocatedSize);
    let allocatedFlexSpace = 0;
    if (totalFlex > 0) {
      let spacePerFlex = canFlex ? freeSpace / totalFlex : NaN;
      this.visitChildren(child => {
        let flex = this._getFlex(child);
        if (flex > 0) {
          let maxChildExtent = canFlex ? child == lastFlexChild ? freeSpace - allocatedFlexSpace : spacePerFlex * flex : Number.POSITIVE_INFINITY;
          let minChildExtent;
          switch (this._getFit(child)) {
            case FlexFit.tight:
              assert(maxChildExtent < Number.POSITIVE_INFINITY);
              minChildExtent = maxChildExtent;
              break;
            case FlexFit.loose:
              minChildExtent = 0;
              break;
          }
          let innerConstraints;
          if (this._crossAxisAlignment === CrossAxisAlignment.stretch) {
            switch (this._direction) {
              case Axis.horizontal:
                innerConstraints = new Constraints({
                  minWidth: minChildExtent,
                  maxWidth: maxChildExtent,
                  minHeight: constraints.maxHeight,
                  maxHeight: constraints.maxHeight
                });
                break;
              case Axis.vertical:
                innerConstraints = new Constraints({
                  minWidth: constraints.maxWidth,
                  maxWidth: constraints.maxWidth,
                  minHeight: minChildExtent,
                  maxHeight: maxChildExtent
                });
                break;
            }
          } else {
            switch (this._direction) {
              case Axis.horizontal:
                innerConstraints = new Constraints({
                  minWidth: minChildExtent,
                  maxWidth: maxChildExtent,
                  maxHeight: constraints.maxHeight
                });
                break;
              case Axis.vertical:
                innerConstraints = new Constraints({
                  maxWidth: constraints.maxWidth,
                  minHeight: minChildExtent,
                  maxHeight: maxChildExtent
                });
                break;
            }
          }
          child.layout(innerConstraints, {
            parentUsesSize: true,
            widgetFactory: this._widgetFactory
          });
          assert(child.size != null);
          const childSize = child.size;
          const childMainSize = this._getMainSize(childSize);
          assert(childMainSize <= maxChildExtent);
          allocatedSize += childMainSize;
          allocatedFlexSpace += maxChildExtent;
          crossSize = max(crossSize, this._getCrossSize(childSize));
        }
      });
    }
    const idealSize = canFlex && this._mainAxisSize == MainAxisSize.max ? maxMainSize : allocatedSize;
    return {
      mainSize: idealSize,
      crossSize: crossSize,
      allocatedSize: allocatedSize
    };
  }
  performLayout() {
    assert(this._widgetFactory != null);
    assert(this._constraints != null);
    const constraints = this._constraints;
    let {
      mainSize: actualSize,
      crossSize,
      allocatedSize
    } = this._computeSizes();
    // baseline support
    switch (this._direction) {
      case Axis.horizontal:
        this.size = constraints.constrain({
          w: actualSize,
          h: crossSize
        });
        actualSize = this.size.w;
        crossSize = this.size.h;
        break;
      case Axis.vertical:
        this.size = constraints.constrain({
          w: crossSize,
          h: actualSize
        });
        actualSize = this.size.h;
        crossSize = this.size.w;
        break;
    }
    const actualSizeDelta = actualSize - allocatedSize;
    this._overflow = max(0, -actualSizeDelta);
    const remainingSpace = max(0, actualSizeDelta);
    let leadingSpace;
    let betweenSpace;
    // flipMainAxis is used to decide whether to lay out
    // left-to-right/top-to-bottom (false), or right-to-left/bottom-to-top
    // (true). The _startIsTopLeft will return null if there's only one child
    // and the relevant direction is null, in which case we arbitrarily decide
    // to flip, but that doesn't have any detectable effect.
    const flipMainAxis = !(this._startIsTopLeft(this._direction) ?? true);
    switch (this._mainAxisAlignment) {
      case MainAxisAlignment.start:
        leadingSpace = 0.0;
        betweenSpace = 0.0;
        break;
      case MainAxisAlignment.end:
        leadingSpace = remainingSpace;
        betweenSpace = 0.0;
        break;
      case MainAxisAlignment.center:
        leadingSpace = remainingSpace / 2.0;
        betweenSpace = 0.0;
        break;
      case MainAxisAlignment.spaceBetween:
        leadingSpace = 0.0;
        betweenSpace = this.childRenderNodeCount > 1 ? remainingSpace / (this.childRenderNodeCount - 1) : 0.0;
        break;
      case MainAxisAlignment.spaceAround:
        betweenSpace = this.childRenderNodeCount > 0 ? remainingSpace / this.childRenderNodeCount : 0.0;
        leadingSpace = betweenSpace / 2.0;
        break;
      case MainAxisAlignment.spaceEvenly:
        betweenSpace = this.childRenderNodeCount > 0 ? remainingSpace / (this.childRenderNodeCount + 1) : 0.0;
        leadingSpace = betweenSpace;
        break;
    }
    // Position elements
    let childMainPosition = flipMainAxis ? actualSize - leadingSpace : leadingSpace;
    this.visitChildren(child => {
      assert(child.size != null);
      let childCrossPosition = 0;
      switch (this._crossAxisAlignment) {
        case CrossAxisAlignment.start:
        case CrossAxisAlignment.end:
          childCrossPosition = this._startIsTopLeft(flipAxis(this._direction)) === (this._crossAxisAlignment === CrossAxisAlignment.start) ? 0.0 : crossSize - this._getCrossSize(child.size);
          break;
        case CrossAxisAlignment.center:
          childCrossPosition = (crossSize - this._getCrossSize(child.size)) / 2.0;
          break;
        case CrossAxisAlignment.stretch:
          childCrossPosition = 0.0;
          break;
        // case CrossAxisAlignment.baseline:
        //   if (_direction == Axis.horizontal) {
        //     assert(textBaseline != null);
        //     final double? distance = child.getDistanceToBaseline(textBaseline!, onlyReal: true);
        //     if (distance != null) {
        //       childCrossPosition = maxBaselineDistance - distance;
        //     } else {
        //       childCrossPosition = 0.0;
        //     }
        //   } else {
        //     childCrossPosition = 0.0;
        //   }
        // break;
        default:
          assert(() => {
            throw Error('Unknown CrossAxisAlignment in Flex performLayout');
          });
      }
      if (flipMainAxis) {
        childMainPosition -= this._getMainSize(child.size);
      }
      switch (this._direction) {
        case Axis.horizontal:
          child.offset = {
            x: childMainPosition,
            y: childCrossPosition
          };
          break;
        case Axis.vertical:
          child.offset = {
            x: childCrossPosition,
            y: childMainPosition
          };
          break;
      }
      if (flipMainAxis) {
        childMainPosition -= betweenSpace;
      } else {
        childMainPosition += this._getMainSize(child.size) + betweenSpace;
      }
    });
  }
  performCommit() {}
}
class LayoutWidgetFlexible extends RenderNodeProxy {
  _fit = FlexFit.loose;
  _flex = 1;
  onMount() {
    assert(() => {
      if (!(this.parentNode instanceof LayoutWidgetFlex)) {
        throw Error('The Parent Node of a LayoutWidgetFlexible widget must be instance of LayoutWidgetFlex');
      }
      return true;
    });
  }
  setProperty(key, value) {
    super.setProperty(key, value);
    switch (key) {
      case 'flex':
        {
          if (value !== this._flex) {
            this._flex = value;
            this.markNeedsLayout();
          }
        }
        break;
      case 'fit':
        {
          if (value !== this._fit) {
            this._fit = value;
            this.markNeedsLayout();
          }
        }
        break;
    }
  }
}
class LayoutWidgetExpanded extends LayoutWidgetFlexible {
  _fit = FlexFit.tight;
}

class LayoutWidgetColumn extends LayoutWidgetFlex {
  _direction = Axis.vertical;
}

class LayoutWidgetHStack extends RenderNodeWithMultiChildren {
  sizedByParent = true;
  performResize() {
    assert(this._constraints != null);
    this.size = this._constraints.biggest;
  }
  performLayout() {
    assert(this.size != null);
    assert(this._widgetFactory != null);
    let leftedWidth = this.size.w;
    this.visitChildren(child => {
      child.layout(new Constraints({
        maxWidth: leftedWidth,
        maxHeight: this.size.h
      }), {
        parentUsesSize: true,
        widgetFactory: this._widgetFactory
      });
      assert(child.size != null);
      leftedWidth -= child.size.w;
    });
    // offset
    let offsetX = 0;
    this.visitChildren(child => {
      let offsetY = (this.size.h - child.size.h) / 2; // 垂直方向居中
      child.offset = {
        x: offsetX,
        y: offsetY
      };
      offsetX += child.size.w;
    });
  }
  performCommit() {}
}

class LayoutWidgetPadding extends RenderNodeWithSingleChild {
  sizedByParent = false;
  _padding = EdgeInsets.zero;
  performResize() {}
  performLayout() {
    assert(this._constraints != null);
    assert(this._widgetFactory != null);
    if (isRenderNode(this.child)) {
      let child = this.child;
      let innerConstraints = this._padding.getInnerConstraints(this._constraints);
      child.layout(innerConstraints, {
        parentUsesSize: true,
        widgetFactory: this._widgetFactory
      });
      assert(child.size != null);
      let size = this._padding.getOutterSize(child.size);
      assert(() => {
        if (!this._constraints.testSize(size)) {
          throw new Error(`Padding out of bounds, size=${JSON.stringify(size)} constraints=${this._constraints?.toString()}`);
        }
        return true;
      });
      this.size = size;
      child.offset = this._padding.innerOffset;
    } else {
      this.size = this._constraints.constrain(this._padding.totalSizeWithoutInner);
    }
  }
  performCommit() {}
  setProperty(key, value) {
    super.setProperty(key, value);
    switch (key) {
      case 'p':
      case 'padding':
        {
          if ((value === null || value instanceof EdgeInsets) && !this._padding.equals(value)) {
            assert(value != null);
            this._padding = value; // TODO copy object instead
            this.markNeedsLayout();
          }
        }
        break;
    }
  }
}

class LayoutWidgetRow extends LayoutWidgetFlex {
  _direction = Axis.horizontal;
}

class LayoutWidgetSizedBox extends RenderNodeWithSingleChild {
  _width = null;
  _height = null;
  _generateChildConstraints() {
    assert(this._constraints != null);
    return Constraints.createTight({
      w: this._width ?? Number.POSITIVE_INFINITY,
      h: this._height ?? Number.POSITIVE_INFINITY
    }).adoptBy(this._constraints);
  }
  performResize() {}
  performLayout() {
    // assert(this.size != null);
    assert(this._widgetFactory != null);
    assert(this._constraints != null);
    let constraints = this._generateChildConstraints();
    if (isRenderNode(this.child)) {
      let child = this.child;
      assert(() => {
        if (!constraints.isTight) {
          throw Error(`constraints.isTight == false constraints=${constraints.toString()}`);
        }
        return true;
      });
      child.layout(constraints, {
        parentUsesSize: false,
        widgetFactory: this._widgetFactory
      });
      child.offset = {
        x: 0,
        y: 0
      };
    }
    this.size = constraints.biggest;
  }
  performCommit() {}
  setProperty(key, value) {
    super.setProperty(key, value);
    switch (key) {
      case 'width':
      case 'w':
        {
          let w = Number(value);
          if (w !== this._width) {
            this._width = w;
            this.markNeedsLayout();
          }
        }
        break;
      case 'height':
      case 'h':
        {
          let h = Number(value);
          if (h !== this._height) {
            this._height = h;
            this.markNeedsLayout();
          }
        }
        break;
    }
  }
}

class LayoutWidgetVStack extends RenderNodeWithMultiChildren {
  sizedByParent = true;
  performResize() {
    assert(this._constraints != null);
    this.size = this._constraints.biggest;
  }
  performLayout() {
    assert(this.size != null);
    assert(this._widgetFactory != null);
    let leftedHeight = this.size.h;
    this.visitChildren(child => {
      child.layout(new Constraints({
        maxWidth: this.size.w,
        maxHeight: leftedHeight
      }), {
        parentUsesSize: true,
        widgetFactory: this._widgetFactory
      });
      assert(child.size != null);
      leftedHeight -= child.size.h;
    });
    // offset
    let offsetY = 0;
    this.visitChildren(child => {
      let offsetX = (this.size.w - child.size.w) / 2; // 水平方向居中
      child.offset = {
        x: offsetX,
        y: offsetY
      };
      offsetY += child.size.h;
    });
  }
  performCommit() {}
}

class LayoutWidgetZStack extends RenderNodeWithMultiChildren {
  _align = Alignment.topLeft;
  _fit = StackFit.loose;
  _computeSize(constraints) {
    let hasNonPositionedChild = false;
    if (this._childRenderNodeCount === 0) {
      return Size.isFinite(constraints.biggest) ? constraints.biggest : constraints.smallest;
    }
    let width = constraints.minWidth;
    let height = constraints.minHeight;
    // Compute constraints for non-positioned child by _stackFit
    let nonPositionedConstraints;
    switch (this._fit) {
      case StackFit.loose:
        nonPositionedConstraints = constraints.loose();
        break;
      case StackFit.expand:
        nonPositionedConstraints = Constraints.createTight(constraints.biggest);
        break;
      case StackFit.passthrough:
        nonPositionedConstraints = constraints;
        break;
    }
    // Size all non-positioned children
    this.visitChildren(child => {
      if (!(child instanceof LayoutWidgetPositioned)) {
        hasNonPositionedChild = true;
        child.layout(nonPositionedConstraints, {
          parentUsesSize: true,
          widgetFactory: this._widgetFactory
        });
        assert(child.size != null);
        width = max(child.size.w, width);
        height = max(child.size.h, height);
      }
    });
    // Compute self size result and then return
    let size;
    if (hasNonPositionedChild) {
      size = {
        w: width,
        h: height
      };
      assert(Size.equals(size, constraints.constrain(size)));
    } else {
      size = constraints.biggest;
    }
    assert(Size.isFinite(size));
    return size;
  }
  _layoutPositionedChild(child) {
    assert(this.size != null);
    assert(this._widgetFactory != null);
    // Compute constraints for positioned child
    // If accurate size for child can be computed, use tighten constraints to make sure child obey that;
    // otherwise, use loosen constraints.
    let childConstraints = new Constraints({});
    if (child._left !== null && child._right !== null) {
      childConstraints = childConstraints.tighten({
        width: this.size.w - child._left - child._right
      });
    } else if (child._width !== null) {
      childConstraints = childConstraints.tighten({
        width: child._width
      });
    }
    if (child._top !== null && child._bottom !== null) {
      childConstraints = childConstraints.tighten({
        height: this.size.h - child._top - child._bottom
      });
    } else if (child._height !== null) {
      childConstraints = childConstraints.tighten({
        height: child._height
      });
    }
    child.layout(childConstraints, {
      parentUsesSize: true,
      widgetFactory: this._widgetFactory
    });
    assert(child.size != null);
    // Calculate offset for positioned child.
    let x;
    if (child._left !== null) {
      x = child._left;
    } else if (child._right !== null) {
      x = this.size.w - child._right - child.size.w;
    } else {
      x = this._align.calcOffset(this.size, child.size).x;
    }
    let y;
    if (child._top !== null) {
      y = child._top;
    } else if (child._bottom !== null) {
      y = this.size.h - child._bottom - child.size.h;
    } else {
      y = this._align.calcOffset(this.size, child.size).y;
    }
    child.offset = {
      x,
      y
    };
  }
  performResize() {}
  performLayout() {
    assert(this._constraints != null);
    assert(this._widgetFactory != null);
    const constraints = this._constraints;
    this.size = this._computeSize(constraints);
    // Compute offset for all children while calculate size for positioned children
    this.visitChildren(child => {
      if (child instanceof LayoutWidgetPositioned) {
        // Can not specify the three options at the same time (because they may have conflict)
        assert(child._left === null || child._right === null || child._width === null);
        assert(child._top === null || child._bottom === null || child._height === null);
        this._layoutPositionedChild(child);
      } else {
        assert(child.size != null);
        child.offset = this._align.calcOffset(this.size, child.size);
      }
    });
  }
  performCommit() {}
  setProperty(key, value) {
    switch (key) {
      case 'ali':
      case 'align':
      case 'alignment':
        {
          if (!(value instanceof Alignment)) break;
          if (value._x !== this._align._x || value._y !== this._align._y) {
            this._align = Alignment.copy(value);
            this.markNeedsLayout();
          }
        }
        break;
      case 'fit':
        {
          if (value !== this._fit) {
            this._fit = value;
            this.markNeedsLayout();
          }
        }
        break;
    }
  }
}
class LayoutWidgetPositioned extends RenderNodeProxy {
  _left = null;
  _right = null;
  _top = null;
  _bottom = null;
  _width = null;
  _height = null;
  setProperty(key, value) {
    super.setProperty(key, value);
    switch (key) {
      case 'l':
      case 'x':
      case 'left':
        {
          if (value !== this._left) {
            this._left = value;
            this.markNeedsLayout();
          }
        }
        break;
      case 'r':
      case 'right':
        {
          if (value !== this._left) {
            this._right = value;
            this.markNeedsLayout();
          }
        }
        break;
      case 't':
      case 'y':
      case 'top':
      case 'up':
        {
          if (value !== this._top) {
            this._top = value;
            this.markNeedsLayout();
          }
        }
        break;
      case 'b':
      case 'bottom':
      case 'down':
        {
          if (value !== this._bottom) {
            this._bottom = value;
            this.markNeedsLayout();
          }
        }
        break;
      case 'w':
      case 'width':
        {
          if (value !== this._width) {
            this._width = value;
            this.markNeedsLayout();
          }
        }
        break;
      case 'h':
      case 'height':
        {
          if (value !== this._height) {
            this._height = value;
            this.markNeedsLayout();
          }
        }
        break;
    }
  }
}

const LayoutManagerFactory = {
  createNode(type) {
    switch (type) {
      case 'hstack':
        return new LayoutWidgetHStack(null, type);
      case 'vstack':
        return new LayoutWidgetVStack(null, type);
      case 'center':
        return new LayoutWidgetCenter(null, type);
      case 'sizedbox':
      case 'sized-box':
      case 'space':
      case 'spacer':
        return new LayoutWidgetSizedBox(null, type);
      case 'align':
        return new LayoutWidgetAlign(null, type);
      case 'flex':
        return new LayoutWidgetFlex(null, type);
      case 'flexible':
        return new LayoutWidgetFlexible(null, type);
      case 'expanded':
        return new LayoutWidgetExpanded(null, type);
      // case 'spacer':
      // return new LayoutWidgetSpacer(null, type);
      case 'row':
        return new LayoutWidgetRow(null, type);
      case 'column':
        return new LayoutWidgetColumn(null, type);
      case 'padding':
        return new LayoutWidgetPadding(null, type);
      case 'stack':
      case 'zstack':
        return new LayoutWidgetZStack(null, type);
      case 'positioned':
        return new LayoutWidgetPositioned(null, type);
      default:
        return null;
    }
  }
};

const {
  render,
  effect,
  memo,
  createComponent,
  createElement,
  createTextNode,
  insertNode,
  insert,
  spread,
  setProp,
  mergeProps
} = createRenderer({
  createElement(type) {
    console.log(`[AsukaUI] createElement type=${type}`);
    assert(AsukaUI.instance != null);
    let core = AsukaUI.instance;
    let el = core.createNode(type);
    if (el === null) el = new AsukaUnknownNode();
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
    console.log(`[AsukaUI] insertNode parent=${parent.nodeName} node=${node.nodeName} anchor=${anchor?.nodeName}`);
    parent.mountChild(node, anchor);
  },
  removeNode(parent, node) {
    console.log(`[AsukaUI] removeNode parent=${parent.nodeName} node=${node.nodeName}`);
    parent.unmountChild(node);
  },
  setProperty(node, name, value) {
    console.log(`[AsukaUI] setProperty node=${node.nodeName} name=${name} value=${value}`);
    //   if (name === 'style') Object.assign(node.style, value);
    //   else if (name.startsWith('on')) node[name.toLowerCase()] = value;
    //   else if (PROPERTIES.has(name)) node[name] = value;
    //   else node.setAttribute(name, value);
    node.setProperty(name, value);
  },
  isTextNode(node) {
    return isTextNode(node);
  },
  getParentNode(node) {
    let parent = node.parentNode;
    if (parent === null) parent = undefined;
    return parent;
  },
  getFirstChild(node) {
    let child = node.firstChild;
    if (child === null) child = undefined;
    return child;
  },
  getNextSibling(node) {
    let next = node.nextSibling;
    if (next === null) next = undefined;
    return next;
  }
});
// export * from '@cuberqaq/asuka-ui';
// export function createRenderer() {
//   return _createRenderer({
//     createElement(type) {
//       assert(AsukaUI.instance != null);
//       let core = AsukaUI.instance!;
//       let el: AsukaNode | null = core.createNode(type);
//       if (el === null) el = new AsukaUnknownNode();
//       return el as AsukaNode;
//     },
//     createTextNode(text) {
//       assert(AsukaUI.instance != null);
//       let core = AsukaUI.instance!;
//       return core.createTextNode(text);
//     },
//     replaceText(node, text) {
//       if (isTextNode(node)) {
//         (node as AsukaTextNode).data = text;
//       }
//     },
//     insertNode(parent, node, anchor) {
//       parent.mountChild(node, anchor);
//     },
//     removeNode(parent, node) {
//       parent.unmountChild(node);
//     },
//     setProperty(node, name, value) {
//       //   if (name === 'style') Object.assign(node.style, value);
//       //   else if (name.startsWith('on')) node[name.toLowerCase()] = value;
//       //   else if (PROPERTIES.has(name)) node[name] = value;
//       //   else node.setAttribute(name, value);
//       console.log('awawa');
//       node.setProperty(name, value);
//     },
//     isTextNode(node) {
//       return isTextNode(node);
//     },
//     getParentNode(node) {
//       let parent: AsukaNode | null | undefined = node.parentNode;
//       if (parent === null) parent = undefined;
//       return parent;
//     },
//     getFirstChild(node) {
//       let child: AsukaNode | null | undefined = node.firstChild;
//       if (child === null) child = undefined;
//       return child;
//     },
//     getNextSibling(node) {
//       let next: AsukaNode | null | undefined = node.nextSibling;
//       if (next === null) next = undefined;
//       return next;
//     },
//   });
// }

const {
  width,
  height,
  screenShape
} = getDeviceInfo();
var designWidth = 480;

/**
 * 动态计算尺寸
 * @param {number} raw 
 */
function px(raw) {
  return Math.ceil(raw / designWidth * width);
}

// path utils for ZeppOS
// @CuberQAQ
// Generated by GPT-4o mini

var util = {
  isString: x => typeof x === "string",
  // 检查是否为字符串
  isObject: x => typeof x === "object" // 检查是否为对象
};

/**
 * 检查路径是否包含协议
 * @param {string} path - 路径字符串
 * @returns {boolean} - 如果路径包含协议，则返回 true
 */
function isProtocolPath(path) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(path);
}

/**
 * 提取协议和路径部分
 * @param {string} path - 路径字符串
 * @returns {{protocol: string, filepath: string}} - 包含协议和文件路径的对象
 */
function extractProtocol(path) {
  const match = path.match(/^([a-zA-Z][a-zA-Z\d+\-.]*):\/\/(.*)$/);
  if (match) {
    return {
      protocol: match[1],
      // 获取协议
      filepath: match[2] // 获取文件路径
    };
  }
  return {
    protocol: null,
    filepath: path
  }; // 如果没有协议，返回原路径
}

/**
 * 解析路径数组并规范化
 * @param {string[]} parts - 路径组成部分
 * @param {boolean} allowAboveRoot - 是否允许上级目录
 * @returns {string[]} - 规范化后的路径部分
 */
function normalizeArray(parts, allowAboveRoot) {
  var res = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];

    // 忽略空部分和当前目录（.）
    if (!p || p === ".") continue;

    // 处理上级目录（..）
    if (p === "..") {
      if (res.length && res[res.length - 1] !== "..") {
        res.pop(); // 移除最后一个部分
      } else if (allowAboveRoot) {
        res.push(".."); // 允许上级目录
      }
    } else {
      res.push(p); // 添加有效部分
    }
  }
  return res;
}

/**
 * 移除数组两端的空元素
 * @param {string[]} arr - 输入数组
 * @returns {string[]} - 去除空元素后的数组
 */
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

// 使用正则表达式分割路径
var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var posix = {};

/**
 * 分割路径
 * @param {string} filename - 输入的路径字符串
 * @returns {string[]} - 分割后的路径组成部分
 */
function posixSplitPath(filename) {
  return splitPathRe.exec(filename).slice(1);
}

/**
 * 解析路径，将相对路径转换为绝对路径
 * @param {...string} paths - 要解析的路径
 * @returns {string} - 解析后的绝对路径
 */
posix.resolve = function () {
  var resolvedPath = "",
    resolvedAbsolute = false;
  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = i >= 0 ? arguments[i] : process.cwd();

    // 跳过空和无效的条目
    if (!util.isString(path)) {
      throw new TypeError("Arguments to path.resolve must be strings");
    } else if (!path) {
      continue;
    }

    // 检查路径是否包含协议
    if (isProtocolPath(path)) {
      const {
        protocol,
        filepath
      } = extractProtocol(path);
      resolvedPath = filepath + "/" + resolvedPath;
      resolvedAbsolute = true; // 将协议路径视为绝对路径
    } else {
      resolvedPath = path + "/" + resolvedPath;
      resolvedAbsolute = path[0] === "/";
    }
  }

  // 规范化路径
  resolvedPath = normalizeArray(resolvedPath.split("/"), !resolvedAbsolute).join("/");
  return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
};

/**
 * 规范化路径，去除多余的斜杠和当前目录
 * @param {string} path - 输入的路径字符串
 * @returns {string} - 规范化后的路径
 */
posix.normalize = function (path) {
  // 检查路径是否包含协议
  if (isProtocolPath(path)) {
    const {
      protocol,
      filepath
    } = extractProtocol(path);
    return protocol + "://" + normalizeArray(filepath.split("/")).join("/");
  }
  var isAbsolute = posix.isAbsolute(path),
    trailingSlash = path && path[path.length - 1] === "/";

  // 规范化路径
  path = normalizeArray(path.split("/"), !isAbsolute).join("/");
  if (!path && !isAbsolute) {
    path = ".";
  }
  if (path && trailingSlash) {
    path += "/";
  }
  return (isAbsolute ? "/" : "") + path;
};

/**
 * 检查路径是否为绝对路径
 * @param {string} path - 输入的路径字符串
 * @returns {boolean} - 如果路径为绝对路径，则返回 true
 */
posix.isAbsolute = function (path) {
  return path.charAt(0) === "/";
};

/**
 * 连接多个路径段为一个路径
 * @param {...string} segments - 要连接的路径段
 * @returns {string} - 连接后的路径
 */
posix.join = function () {
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

/**
 * 计算相对路径
 * @param {string} from - 起始路径
 * @param {string} to - 目标路径
 * @returns {string} - 相对路径
 */
posix.relative = function (from, to) {
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

/**
 * 获取路径的目录名
 * @param {string} path - 输入的路径字符串
 * @returns {string} - 目录名
 */
posix.dirname = function (path) {
  var result = posixSplitPath(path),
    root = result[0],
    dir = result[1];
  if (!root && !dir) {
    return ".";
  }
  if (dir) {
    dir = dir.substr(0, dir.length - 1); // 去掉尾部斜杠
  }
  return root + dir;
};

/**
 * 获取路径的基本名
 * @param {string} path - 输入的路径字符串
 * @param {string} [ext] - 可选的扩展名，如果提供则将其从基本名中去除
 * @returns {string} - 基本名
 */
posix.basename = function (path, ext) {
  var f = posixSplitPath(path)[2];
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

/**
 * 获取路径的扩展名
 * @param {string} path - 输入的路径字符串
 * @returns {string} - 扩展名
 */
posix.extname = function (path) {
  return posixSplitPath(path)[3];
};

/**
 * 格式化路径对象为路径字符串
 * @param {Object} pathObject - 路径对象
 * @param {string} pathObject.root - 根路径
 * @param {string} pathObject.dir - 目录路径
 * @param {string} pathObject.base - 基本文件名
 * @param {string} pathObject.ext - 扩展名
 * @param {string} pathObject.name - 文件名（不包含扩展名）
 * @returns {string} - 格式化后的路径字符串
 */
posix.format = function (pathObject) {
  if (!util.isObject(pathObject)) {
    throw new TypeError("Parameter 'pathObject' must be an object, not " + typeof pathObject);
  }
  var root = pathObject.root || "";
  if (!util.isString(root)) {
    throw new TypeError("'pathObject.root' must be a string or undefined, not " + typeof pathObject.root);
  }
  var dir = pathObject.dir ? pathObject.dir + posix.sep : "";
  var base = pathObject.base || "";
  return dir + base;
};

/**
 * 解析路径字符串为路径对象
 * @param {string} pathString - 输入的路径字符串
 * @returns {{root: string, dir: string, base: string, ext: string, name: string}} - 路径对象
 */
posix.parse = function (pathString) {
  if (!util.isString(pathString)) {
    throw new TypeError("Parameter 'pathString' must be a string, not " + typeof pathString);
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
posix.sep = "/"; // POSIX 路径分隔符
posix.delimiter = ":"; // POSIX 路径分隔符（用于环境变量）
 // 导出 posix 模块

// HZ-Engine Package (hzpk) utils for Zepp OS
const head_magic = Uint8Array.from("HZENGINE-PACKAGE!", ch => ch.charCodeAt(0));
const head_version = Uint8Array.from([1, 0, 0]);
const info_version = "1.0.0";
function checkHzpk_v1(path) {
  // 检查文件是否为 hzpk 以及 hzpk 头版本是否为 1.0.0
  if (!hmFS.statSync({
    path
  })) return {
    isHzpk: false,
    error: "读取 hzpk 失败"
  };

  //   let fd = hmFS.openSync({ path: "assets://icon.png", flag: hmFS.O_RDONLY })
  //   let buf = new Uint8Array(10).buffer
  //   hmFS.readSync({fd, buffer: buf})

  //   console.log("end test");

  // TODO  end test

  let code = hmFS.openSync({
    path,
    flag: hmFS.O_RDONLY
  });
  if (code < 0) {
    return {
      isHzpk: false,
      error: "打开 hzpk 失败"
    };
  }
  let headLen = head_magic.length + head_version.length;
  let buffer = new ArrayBuffer(headLen);
  let buf_view = new Uint8Array(buffer);
  let len = hmFS.readSync({
    fd: code,
    buffer,
    options: {
      length: headLen
    }
  });
  //   hmFS.closeSync({ fd: code });
  if (len !== headLen) {
    hmFS.closeSync({
      fd: code
    });
    return {
      isHzpk: false,
      error: `无效的 hzpk（头长度不匹配，应为 ${headLen}，实际为 ${len}，buffer：${buffer.toString()}）`
    };
  }
  let offset = 0;
  // test magic
  for (let i = 0; i < head_magic.length; i++) {
    if (buf_view[i + offset] !== head_magic[i]) {
      hmFS.closeSync({
        fd: code
      });
      return {
        isHzpk: false,
        error: `无效的 hzpk（magic 不匹配, 位置 ${offset}, buffer[${i + offset}]=${buf_view[i + offset]}, head_magic[${i}]=${head_magic[i]}, 应为 ${Buffer.from(head_magic.buffer).toString()}, 实际为 ${Buffer.from(buffer.slice(offset, offset + head_magic.length)).toString()}）`
      };
    }
  }
  offset += head_magic.length;
  // test version
  for (let i = 0; i < head_version.length; i++) {
    if (buf_view[i + offset] !== head_version[i]) {
      hmFS.closeSync({
        fd: code
      });
      return {
        isHzpk: false,
        error: `不支持该版本的 hzpk`
      };
    }
  }
  offset += head_version.length;

  // read info
  let info_len = readNumber(path, offset);
  offset += calcNumberBytes(info_len);
  let info_buf = new ArrayBuffer(info_len);
  len = hmFS.readSync({
    fd: code,
    buffer: info_buf,
    options: {
      position: offset,
      length: info_len
    }
  });
  if (len !== info_len) {
    hmFS.closeSync({
      fd: code
    });
    return {
      isHzpk: false,
      error: "hzpk 包信息长度不完整"
    };
  }
  let info;
  try {
    info = JSON.parse(Buffer.from(info_buf).toString());
  } catch (error) {
    hmFS.closeSync({
      fd: code
    });
    return {
      isHzpk: false,
      error: "hzpk 包信息解析失败"
    };
  }
  offset += info_len;

  // test info version
  if (info.version !== info_version) {
    hmFS.closeSync({
      fd: code
    });
    return {
      isHzpk: false,
      error: "不支持该版本的 hzpk 信息"
    };
  }
  hmFS.closeSync({
    fd: code
  });
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
  // test if target dir exists
  if (hmFS.readdirSync({
    path: target_dir
  })?.length > 0) {
    // throw new Error("目标目录不为空");
    clearDir(target_dir);
  }
  if (hmFS.readdirSync({
    path: target_dir
  }) == undefined) {
    hmFS.mkdirSync({
      path: target_dir
    });
  }
  let code = hmFS.openSync({
    path: hzpk_path,
    flag: hmFS.O_RDONLY
  });
  if (code < 0) {
    throw new Error("打开 hzpk 失败");
  }
  function traverseDir(files_info, dir) {
    for (let file in files_info) {
      let file_info = files_info[file];
      if (file_info.isDirectory) {
        if (hmFS.readdirSync({
          path: posix.join(dir, file)
        }) === undefined) {
          hmFS.mkdirSync({
            path: posix.join(dir, file)
          });
        }
        traverseDir(file_info.files_info, posix.join(dir, file));
      } else {
        let file_path = posix.join(dir, file);
        let buffer = new ArrayBuffer(file_info.size);
        hmFS.readSync({
          fd: code,
          buffer,
          options: {
            position: offset + file_info.offset,
            length: file_info.size
          }
        });
        hmFS.writeFileSync({
          path: file_path,
          data: buffer
        });
        // if (onProgress) {
        //   onProgress();
        // }
      }
    }
  }
  traverseDir(files_info, target_dir);
  hmFS.closeSync({
    fd: code
  });
}

/**
 * 从 offset 开始循环，直到读取的字节不是 127，然后将循环过的字节的数字加起来
 * @param {*} buffer
 * @param {*} offset
 */
function readNumber(path, offset) {
  let code = hmFS.openSync({
    path
  });
  let len = hmFS.statSync({
    path
  })?.size;
  if (code < 0 || len === undefined) {
    return -1;
  }
  let sum = 0;
  let buffer = new ArrayBuffer(1);
  let buf_view = new Uint8Array(buffer);
  for (let p = offset;; p++) {
    if (p >= len) {
      hmFS.closeSync({
        fd: code
      });
      return -2;
    }
    hmFS.readSync({
      fd: code,
      buffer,
      options: {
        position: p,
        length: 1
      }
    });
    sum += buf_view[0];
    if (buf_view[0] !== 255) break;
  }
  return sum;
}
function calcNumberBytes(number) {
  if (number < 0) throw Error("calc number bytes must be >= 0");
  return Math.floor(number / 255) + 1;
}
function isFileSync({
  path
}) {
  let code = hmFS.openSync({
    path
  });
  if (code >= 0) {
    hmFS.closeSync({
      fd: code
    });
    return true;
  } else {
    return false;
  }
}
function clearDir(target_path) {
  if (isFileSync({
    path: target_path
  })) {
    hmFS.rmSync({
      path: target_path
    });
  } else {
    for (let file of hmFS.readdirSync({
      path: target_path
    })) {
      clearDir(posix.join(target_path, file));
    }
  }
}
const hzpk_list_path = "data://hzpk_list.json";
function getHzpkList() {
  let hzpk_list = [];
  if (!isFileSync({
    path: hzpk_list_path
  })) {
    hmFS.writeFileSync({
      path: hzpk_list_path,
      data: JSON.stringify(hzpk_list)
    });
  } else {
    hzpk_list = JSON.parse(hmFS.readFileSync({
      path: hzpk_list_path,
      options: {
        encoding: "utf8"
      }
    }));
  }
  return hzpk_list;
}
function addHzpk(hzpk) {
  let hzpk_list = getHzpkList();
  // place in the first place
  hzpk_list.unshift(hzpk);
  hmFS.writeFileSync({
    path: hzpk_list_path,
    data: JSON.stringify(hzpk_list)
  });
}
function removeHzpkByUuid(uuid) {
  // remove from hzpk list and clear the hzpk dir
  let hzpk_list = getHzpkList();
  for (let i = 0; i < hzpk_list.length; i++) {
    if (hzpk_list[i].uuid === uuid) {
      let hzpk = hzpk_list.splice(i, 1)[0];
      clearDir(hzpk.dir);
      hmFS.writeFileSync({
        path: hzpk_list_path,
        data: JSON.stringify(hzpk_list),
        options: {
          encoding: "utf8"
        }
      });
      break;
    }
  }
}

export { AsukaUI as A, CrossAxisAlignment as C, EdgeInsets as E, For as F, LayoutManagerFactory as L, Match as M, NativeBindingsFactory as N, Switch as S, createElement as a, insert as b, createSignal as c, createComponent as d, effect as e, MainAxisAlignment as f, Alignment as g, StackFit as h, insertNode as i, reportError as j, checkHzpk_v1 as k, removeHzpkByUuid as l, memo as m, addHzpk as n, getHzpkList as o, px as p, posix as q, render as r, setProp as s, unpackHzpk_v1 as u };
