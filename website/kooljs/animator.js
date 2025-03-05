// Copyright (c) 2025 Ji-Podhead and Project Contributors
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the following conditions:
// 1. All commercial uses of the Software must:
//    a) Include visible attribution to all contributors (listed in CONTRIBUTORS.md).
//    b) Provide a direct link to the original project repository (https://github.com/ji-podhead/kooljs).
// 2. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// import { parse } from "@babel/parser"
// import * as recast from "recast";
// import {
//   start_animations,
//   setMatrix,
//   get_lerp_value,
//   get_constant_row,
//   set_duration,
//   hard_reset,
//   lambda_call,
//   get_constant_number,
//   reorient_duration,
//   reorient_target,
//   reorient_duration_by_distance,
//   get_constant,
//   reorient_duration_by_progress,
//   get_delay,
//   set_delay,
// } from "kooljs/worker";
const worker_functions = [
  "get_status",
  "addTrigger",
  "removeTrigger",
  "get_time",
  "set_time",
  "get_step",
  "get_sequence_length",
  "set_sequence_start",
  "get_sequence_start",
  "set_sequence_length",
  "set_step",
  "is_active",
  "get_active",
  "start_animations",
  "stop_animations",
  "setLerp",
  "setMatrix",
  "get_lerp_value",
  "soft_reset",
  "hard_reset",
  "get_duration",
  "set_duration",
  "set_sequence_length",
  "change_framerate",
  "get_constant",
  "get_constant_number",
  "get_constant_row",
  "render_constant",
  "update_constant",
  "set_delay,get_delay",
  "get_delay_delta",
  "set_delay_delta",
  "lambda_call",
  "get_step_lerp_target_value",
  "reorient_duration",
  "reverse",
  "reorient_target",
  "reorient_duration_by_distance",
  "reorient_duration_by_progress",
  "set_group_orientation",
  "get_group_values",
  "set_group_values",
  "stop_group",
  "start_group",
  "reverse_group_delays",
  "reset_group",
  "lerp",
  "normalizeDistance",
  "clamp",
];
var old_length, newlength, ofset, temp;
function add_to_buffer(animator, target, array) {
  old_length = animator[target].byteLength;
  newlength =
    old_length +
    (array.byteLength != undefined ? array.byteLength : array.length * 4);
  if (newlength % 4 == 0) {
    ofset = 0;
  } else {
    ofset = 4 - (newlength % 4);
  }
  newlength += ofset;
  animator[target].resize(newlength);
  if (array.byteLength == undefined || array.byteLength / 4 == array.length) {
    temp = new Float32Array(animator[target], old_length + ofset, array.length);
  } else if (array.byteLength / 2 == array.length) {
    temp = new Uint16Array(animator[target], old_length + ofset, array.length);
  } else if (array.byteLength / 1 == array.length) {
    temp = new Uint8Array(animator[target], old_length + ofset, array.length);
  }
  Object.assign(temp, array);
  return temp;
}
class Prop {
  update_callback(value, id) {
    this.setter(value, id);
  }
  /**
   * Creates a new Prop instance.
   * @param {function} render_callback - the setter function that will get called with the updated value
   * @param {number|undefined} default_value - the default value of the animation property
   */
  constructor(render_callback, default_value = undefined) {
    this.default_value = default_value;
    this.setter = render_callback;
    this.updater = this.update_callback;
  }
}
var index;
class Constant {
  /**
   * Creates a new Constant instance.
   * @param {Animator} animator - the Animator Instance
   * @param {object} options - options for the constant
   * @param {string} type - the type of the constant can be number, matrix
   * @param { number | list } value - all lists will get merged to a map of float32 arrays, where numbers are one giant float32 array
   * @param { function | list } [render_callbacks] - a function or list of functions that gets called when the constant value gets updated
   * @param { function | list } [render_triggers] - a function or list of functions that gets called when the constant value gets updated
   * @returns {dict } Constant - returns a instance of a Constant consisting of the id and value: {id:number, value:number|map}
   * - RenderCallbacks:
   *  {
   *  id: number,
   *  args: string
   *  }
   * - RenderTriggers: list(callback_id's)
   *
   */
  constructor(animator, { type, value, render_callbacks, render_triggers }) {
    this.id = animator.constant_count;
    animator.constant_count += 1;
    if (type == "matrix") {
      value.map((row, index) => {
        value[index] = add_to_buffer(animator, "buffer", value[index]);
      });
    }
    animator.constant_map.get(type).set(this.id, value);
    this.value = animator.constant_map.get(type).get(this.id);
    if (render_triggers != undefined || render_callbacks != undefined) {
      if (render_callbacks != undefined) {
        animator.constant_map
          .get("render_callbacks")
          .set(this.id, render_callbacks);
      }
      if (render_triggers != undefined) {
        animator.constant_map
          .get("render_triggers")
          .set(
            this.id,
            add_to_buffer(animator, "buffer", new Uint8Array(render_triggers))
          );
      }
    }
  }
}
var lambda_index;
function addCallback(animator, callback, animProps) {
  lambda_index = animator.callback_map.size;
  if (typeof callback == "function") {
    callback = callback.toString();
    callback = worker_functions.reduce((str, func) => {
      // eg (0,kooljs_worker__WEBPACK_IMPORTED_MODULE_0__.get_constant_row) where the second 0 can be any number
      return str.replace(
        new RegExp(
          `\\(0,kooljs_worker_functions__WEBPACK_IMPORTED_MODULE_(\\d+?)__.${func}\\)`,
          "g"
        ),
        "this." + func
      );
    }, callback);
    var val;
    callback = callback.replace(/`\$\{([^}]+)\}`/g, (match, group) => {
      group = group.split(".");
      group.map((x, i) => {
        if (i > 0) {
          try {
            val = val[x];
          } catch {
            console.warn("error in callback: " + callback);
            console.error(
              "animProps is missing the entry: " + x + " in " + group
            );
          }
        } else {
          val = animProps;
        }
      });
      if (val != undefined && group.length > 1) {
        return val;
      }
      return match;
    });
  } else if (typeof callback != "string") {
    return console.log("callback is not a string and animProps is undefined");
  }
  animator.callback_map.set(lambda_index, callback);
  return lambda_index;
}
class Lambda {
  /**
   * @param {Animator} animator - the Animator Instance
   * @param {string | function  } callback - the type of the constant can be number, matrix
   * @param {dict |  undefined} animProps - used to pass your animation properties.
   *      * ***Only needed if you pass a function as a callback.***
   *      * The used props need to have this structure: &#96;${prop}&#96;
   * @returns {number} id  - animator.lambda_map.size
   */
  constructor(animator, { callback, animProps }) {
    this.id = addCallback(animator, callback, animProps);
    this.animator = animator;
  }
  call(args) {
    this.animator.lambda_call(this.id, args);
  }
}
function addTiggers(
  index,
  animator,
  animationTriggers,
  stepLength,
  loop,
  loop_start_time
) {
  if (loop == true) {
    animator.registry_map.get("loop").push(1);
    const loop_trigger = {
      step: stepLength - 2,
      start: loop_start_time,
      target: index,
    };
    if (animationTriggers == undefined) {
      animationTriggers = [loop_trigger];
    } else {
      animationTriggers.push(loop_trigger);
    }
  } else {
    animator.registry_map.get("loop").push(0);
  }
  if (animationTriggers != undefined) {
    const stepMap = new Map();

    let st = new Array(stepLength);
    // im sorting after steps and then add the values to the registr.
    animationTriggers.map((t) => {
      if (Array.isArray(st[t.step]) == false) {
        st[t.step] = [];
      }
      st[t.step].push([t.target, t.start]);
    });
    st.map((s, i) => {
      if (s.length > 0) {
        const frames = new Map();
        s.map((x) => {
          if (frames.get(x[1]) == undefined) {
            frames.set(x[1], []);
          }
          frames.get(x[1]).push(x[0]);
        });

        frames.forEach((targets, frame) => {
          frames.set(
            frame,
            add_to_buffer(animator, "buffer", new Uint8Array(targets))
          );
        });

        stepMap.set(i, frames);
      }
    });
    animator.trigger_map.set(index, stepMap);
  }
}
class Lerp {
  /**
   * Creates a new Lerp object.
   * @param {Animator} animator - the animator object
   * @param {Object} options - options for the Lerp object
   * @param {function} render_callback - the callback function for when the animation is rendered
   * @param {number} [duration=10] - the duration of the animation in seconds
   * @param {number} [render_interval=1] - the interval in which the animation is rendered in seconds
   * @param {number} [smoothstep=1] - the smoothstep value for the animation
   * @param {number} [delay=0] - the delay before the animation starts
   * @param {Array} [animationTriggers] - the animation triggers
   * @param {function|string} [callback.callback] - the callback function for when the animation is finished
   * @param {dict | undefined} [callback.animProps] - the props used for the callback, when callback is not a string
   * @param {Array} [steps] - the steps of the animation
   * @param {boolean} [loop=false] - whether or not the animation should loop
   * @param {number} [steps_max_length] - the maximum length of the steps array
   */
  constructor(
    animator,
    {
      render_callback,
      group = -1,
      duration = 10,
      render_interval = 1,
      smoothstep = 1,
      delay = 0,
      animationTriggers,
      callback,
      steps = undefined,
      loop = false,
      steps_max_length,
      type = 2,
    }
  ) {
    //currentValue = currentValue;
    index = animator.registry_map.get("type").length;
    this.id = index;
    this.lerpStart = undefined;
    animator.count += 1;
    animator.registry_map
      .get("lerp_chain_start")
      .push(animator.chain_map_points_length);
    const step_length =
      steps != undefined
        ? steps.length
        : steps_max_length != undefined
        ? steps_max_length
        : 0;
    if (step_length != 0) {
      if (loop == true || animationTriggers != undefined) {
        addTiggers(
          index,
          animator,
          animationTriggers,
          step_length,
          loop,
          duration
        );
      } else {
        animator.registry_map.get("loop").push(0);
      }
      animator.chain_map.get("lengths").push(steps.length - 1);
      animator.chain_map.get("progress").push(0);
      if (steps_max_length != undefined) {
        const n = new Array(steps_max_length - steps.length).fill(
          0,
          0,
          steps_max_length - steps.length
        );
        steps = steps.concat(n);
      }
      animator.chain_map.set(
        "buffer",
        animator.chain_map.get("buffer").concat(steps)
      );
      animator.chain_map_points_length += steps.length;
    } else {
      return console.error("Lerp needs a steps array, or a steps_max_length");
    }
    animator.registry_map.get("duration").push(duration);
    animator.registry_map.get("render_interval").push(render_interval);
    animator.registry_map.get("delay_delta").push(0);
    animator.registry_map.get("type").push(type);
    animator.registry_map.get("delay").push(delay);
    animator.registry_map.get("progress").push(0);
    animator.registry_map.get("smoothstep").push(smoothstep);
    animator.active_buffer_bytelength += 1;
    const callback_id =
      callback != undefined
        ? addCallback(animator, callback.callback, callback.animProps)
        : undefined;
    if (type != 4) {
      animator.results.get("number_results").push(steps[0]);
      if (group == -1) {
        animator.animation_objects.set(this.id, {
          index: index,
          prop: new Prop(render_callback),
          callback_id: callback_id,
        });
      }
    }
    if (callback_id != undefined) {
      animator.registry_map.get("lerp_callbacks").set(this.id, matrix_lerp_id);
    }
  }
}
class Timeline {
  /**
   * Creates a new Timeline object.
   * A Timeline is a type of animation similar to Lerp, but it does not fire a callback after each animation frame.
   * It is used to trigger and control other animations such as timelines, lerps, and matrixLerps.
   * @param {Animator} animator - The animator instance.
   * @param {Object} options - Options for the Timeline object.
   * @param {Function} render_callback - The function called when the animation renders.
   * @param {Number} [duration=10] - The duration of the animation.
   * @param {Number} [render_interval=1] - The interval at which the animation should render.
   * @param {Number} [delay=0] - The delay before the animation starts.
   * @param {Object} [animationTriggers] - Animation triggers.
   * @param {function|string} [callback.callback] - the callback function for when the animation is finished
   * @param {dict | undefined} [callback.animProps] - the props used for the callback, when callback is not a string
   * @param {Boolean} [loop=false] - Whether the animation should loop.
   * @param {Number} [length] - The amount of steps in the timeline. length of 1 equals steps.length=2. ***This is a required parameter if steps is not defined***.
   * @returns {Lerp} The created Timeline object as a Lerp instance.
   */
  constructor(
    animator,
    {
      steps,
      length,
      render_callback,
      duration,
      render_interval,
      delay,
      animationTriggers,
      callback,
      loop,
    }
  ) {
    length = length != undefined ? (length += 1) : undefined;
    if (length == undefined && steps == undefined) {
      return console.error("step_length is undefined and no steps given");
    }

    return new Matrix_Lerp(animator, {
      type: 4,
      group: -1,
      render_callback: render_callback,
      duration: duration,
      render_interval: render_interval,
      smoothstep: 0,
      delay: delay,
      animationTriggers: animationTriggers,
      callback: callback,
      loop: loop,
      steps_max_length: length,
    });
  }
}
var matrix_lerp_id;
class Matrix_Lerp {
  /**
   * Creates a new MatrixLerp object.
   * @param {Animator} animator - the animator object
   * @param {Object} options - options for the MatrixLerp object
   * @param {function} render_callback - the callback function for when the animation is rendered
   * @param {number} [duration=10] - the duration of the animation in seconds
   * @param {number} [render_interval=1] - the interval in which the animation is rendered in seconds
   * @param {number} [smoothstep=1] - the smoothstep value for the animation
   * @param {number} [delay=0] - the delay before the animation starts
   * @param {Array} [animationTriggers] - the animation triggers
   * @param {function|string} [callback.callback] - the callback function for when the animation is finished
   * @param {dict | undefined} [callback.animProps] - the props used for the callback, when callback is not a string
   * @param {Array} [steps] - the steps of the animation
   * @param {boolean} [loop=false] - whether or not the animation should loop
   * @param {number} [steps_max_length] - the maximum length of the steps array
   */
  constructor(
    animator,
    {
      type = 3,
      group = -1,
      render_callback,
      duration = 10,
      render_interval = 1,
      smoothstep = 1,
      delay = 0,
      animationTriggers,
      callback,
      steps = undefined,
      loop = false,
      steps_max_length,
    }
  ) {
    //currentValue = currentValue;
    index = animator.registry_map.get("type").length;
    this.id = index;
    animator.count += 1;
    animator.registry_map.get("lerp_chain_start").push(0);
    const matrix_map = new Map();
    var old_length, temp, newlength;
    if (steps != undefined) {
      steps.map((step, index) => {
        const res = add_to_buffer(animator, "buffer", step);
        matrix_map.set(index, res);
      });
    }
    const step_length =
      steps != undefined
        ? steps.length
        : steps_max_length != undefined
        ? steps_max_length
        : 0;
    if (step_length != 0 && (loop == true || animationTriggers != undefined)) {
      addTiggers(
        index,
        animator,
        animationTriggers,
        step_length,
        loop,
        duration
      );
    } else {
      animator.registry_map.get("loop").push(0);
    }
    animator.chain_map.get("matrix_buffer").set(index, matrix_map);
    animator.chain_map_points_length += 1;
    animator.chain_map.get("lengths").push(1);
    animator.chain_map.get("progress").push(0);
    animator.registry_map.get("duration").push(duration);
    animator.registry_map.get("type").push(type);
    animator.registry_map.get("render_interval").push(render_interval);
    animator.registry_map.get("delay_delta").push(0);
    animator.registry_map.get("delay").push(delay);
    animator.registry_map.get("progress").push(0);
    animator.registry_map.get("smoothstep").push(smoothstep);
    matrix_lerp_id =
      callback != undefined
        ? addCallback(animator, callback.callback, callback.animProps)
        : undefined;
    if (type != 4) {
      animator.results
        .get("matrix_results")
        .set(this.id, add_to_buffer(animator, "buffer", steps[0]));
      if (group == -1) {
        animator.animation_objects.set(this.id, {
          index: index,
          prop: new Prop(render_callback),
          callback_id: matrix_lerp_id,
        });
      }
    }
    if (matrix_lerp_id != undefined) {
      animator.registry_map.get("lerp_callbacks").set(this.id, matrix_lerp_id);
    }
  }
}
class Group {
  constructor(animator, callback, type) {
    this.id = animator.grouped_animation_objects.size;
    this.type = type;
    animator.grouped_animation_objects.set(this.id, {
      prop: new Prop(callback),
      callback: callback,
      type: this.type,
    });
  }
}
class MatrixChain {
  set_reference_index(step, invert_step) {
    if (invert_step == undefined) invert_step == start_step + 1;
    if (
      step >= 0 &&
      step < this.animator.matrix_chain_map.max_length.value &&
      invert_step >= 0 &&
      step <= this.animator.matrix_chain_map.max_length.value
    ) {
      this.animator.update_constant(
        this.animator.matrix_chain_map.orientation_step.id,
        "matrix",
        [step, invert_step]
      );
    } else {
      console.error(
        "step out of bounds! max length is: " +
          this.animator.matrix_chain_map.max_length.value
      );
    }
  }
  constructor(
    animator,
    {
      length,
      reference_matrix,
      min_duration,
      max_duration,
      custom_delay = -1,
      loop,
      group_loop,
      start_step = 0,
      target_step = 1,
      sequence_length,
      id_prefix = "",
      callback,
    }
  ) {
    group_loop = group_loop = undefined ? false : group_loop;
    loop = loop = undefined ? false : loop;
    // const length=reference_matrix.length
    this.uni_reference = false;
    if (loop == true) {
      if (sequence_length == undefined) sequence_length = 2;
    } else if (sequence_length == undefined) {
      sequence_length = reference_matrix[0].length;
    }
    this.animator = animator;
    if (reference_matrix.length != length) {
      if (reference_matrix.length == 1) {
        this.animator.matrix_chain_map.get("uni_size").push(1);
        this.uni_reference = true;
      } else {
        return error(
          "ref matrix either needs to have a length of 1 or " + length
        );
      }
    } else {
      this.animator.matrix_chain_map.get("uni_size").push(0);
    }
    this.group = new Group(animator, (val) => callback(val, id_prefix), 3);
    this.id = this.group.id;
    animator.results.get("group_results").set(this.id, new Map());
    this.indices = [];
    this.animator.matrix_chain_map
      .get("max_length")
      .push(reference_matrix[0].length);
    this.animator.matrix_chain_map.get("min_duration").push(min_duration);
    this.animator.matrix_chain_map.get("max_duration").push(max_duration);
    this.animator.matrix_chain_map.get("sequence_length").push(sequence_length);
    group_loop = group_loop == false ? 0 : 1;
    this.animator.matrix_chain_map.get("group_loop").push(group_loop);
    if (typeof custom_delay == "object" && custom_delay.callback != undefined) {
      const lambda = new Lambda(animator, custom_delay);
      this.animator.matrix_chain_map.get("custom_delay").push(lambda.id);
    } else {
      if (typeof custom_delay == "object") {
        if (custom_delay.length != length) {
          return Error(
            "MatrixChain failed! your delay list has not the right length! This would break the Registry, so pls fix that!"
          );
        }
      } else if (typeof custom_delay != "number") {
        return Error(
          "MatrixChain failed! your delay is not a number, list! This would break the Registry, so pls fix that!"
        );
      } else if (custom_delay < 0 || custom_delay == undefined) {
        custom_delay = 0;
        console.warn("no valid delay given, setting it to -1");
      }
      this.animator.matrix_chain_map.get("custom_delay").push(-1);
    }
    if (reference_matrix[0].length > 2) {
      if (target_step == undefined) target_step == start_step + 1;
      if (
        start_step >= 0 &&
        start_step < reference_matrix[0].length &&
        target_step >= 0 &&
        start_step <= reference_matrix[0].length
      ) {
        this.animator.matrix_chain_map
          .get("orientation_step")
          .set(this.id, [start_step, target_step]);
      } else {
        console.error(
          "step out of bounds! max length is: " + reference_matrix[0].length
        );
        return Error("MatrixChain failed!");
      }
    } else {
      this.animator.matrix_chain_map
        .get("orientation_step")
        .set(this.id, [0, 1]);
    }
    var mLerp, delay_temp;
    var steps = [
      reference_matrix[0][start_step],
      reference_matrix[0][target_step],
    ];
    for (let i = 0; i < length; i++) {
      if (
        typeof custom_delay == "object" &&
        custom_delay.callback != undefined
      ) {
        delay_temp = 0;
      } else if (typeof custom_delay == "object") {
        delay_temp = custom_delay[i];
      } else {
        delay_temp = custom_delay;
      }
      if (this.uni_reference != true) {
        steps = [
          reference_matrix[i][start_step],
          reference_matrix[i][target_step],
        ];
      }
      mLerp = new Matrix_Lerp(animator, {
        duration: min_duration,
        steps: steps,
        delay: delay_temp,
        loop: loop,
        group: this.id,
        type: 3,
      });
      animator.registry_map.get("group").set(mLerp.id, this.id);
      animator.registry_map.get("group_lookup").set(mLerp.id, i);
      //animator.results.get("group_results").get(this.id).set(i,new Float32Array(reference_matrix[i][forward_step]))
      this.indices.push(mLerp.id);
    }
    reference_matrix = reference_matrix.flat(1);
    const new_ref = new Map();
    var old_length;
    reference_matrix.map((r, i) => {
      new_ref.set(i, add_to_buffer(animator, "buffer", r));
    });
    //reference_matrix.map((x,i)=>new_ref.set(i,new Float32Array(x)))
    this.animator.matrix_chain_map.get("ref_matrix").set(this.id, new_ref);
    this.indices = add_to_buffer(
      animator,
      "buffer",
      new Uint8Array(this.indices)
    );
    this.animator.matrix_chain_map.get("indices").set(this.id, this.indices);
  }
}
class Animator {
  /**
   * The Animator Class lets you create and control the animation thread to manage your animations
   * @param {number} fps - the fps to render animations; default: 33.33
   * @param {boolean} autostart - whether or not to call the init method after construction; default: true
   * @class
   * @author JI-Podhead
   */
  constructor(fps = 45, max_byte_length = 100000) {
    this.count = 0;
    //      --> REGRISTRIES <--
    this.registry_map = new Map();
    this.callback_map = new Map();
    this.trigger_map = new Map();
    this.chain_map = new Map();
    this.matrix_chain_map = new Map();
    this.spring_map = new Map();
    this.matrix_chain_map = new Map();
    //-->Matrix_chains<<--
    this.matrix_chain_map.set("ref_matrix", new Map());
    this.matrix_chain_map.set("orientation_step", new Map());
    this.matrix_chain_map.set("indices", new Map());
    this.matrix_chain_map.set("custom_delay", []);
    this.matrix_chain_map.set("sequence_length", []);
    this.matrix_chain_map.set("group_loop", []);
    this.matrix_chain_map.set("min_duration", []);
    this.matrix_chain_map.set("max_duration", []);
    this.matrix_chain_map.set("max_length", []);
    this.matrix_chain_map.set("uni_size", []);
    //--> constant <--
    this.constant_map = new Map();
    this.constant_map.set("number", new Map());
    this.constant_map.set("matrix", new Map());
    this.constant_map.set("render_callbacks", new Map());
    this.constant_map.set("render_triggers", new Map());
    //--> animation objects (Lerp...) <--
    this.registry_map.set("type", []);
    this.registry_map.set("duration", []);
    this.registry_map.set("render_interval", []);
    this.registry_map.set("delay_delta", []);
    this.registry_map.set("delay", []);
    this.registry_map.set("progress", []);
    this.registry_map.set("smoothstep", []);
    this.registry_map.set("lerp_chain_start", []);
    this.registry_map.set("loop", []);
    this.registry_map.set("timelines", []);
    this.registry_map.set("group", new Map());
    this.registry_map.set("group_lookup", new Map());
    this.registry_map.set("lerp_callbacks", new Map());
    // --> chains <--
    this.chain_map_points = [];
    this.chain_map_points_length = 0;
    this.chain_map.set("buffer", []);
    this.chain_map.set("matrix_buffer", new Map());
    this.chain_map.set("progress", []);
    this.chain_map.set("lengths", []);

    //      --> Spring <--
    this.spring_map.set("spring_elements", []);
    this.spring_map.set("spring_duration", []);
    this.spring_map.set("spring_tension", []);
    //     --> SHArED <--
    this.results = new Map();
    this.results.set("group_results", new Map());
    this.results.set("matrix_results", new Map());
    this.results.set("number_results", []);
    //      --> UTIL <--
    this.fps = fps;
    this.constant_count = 0;
    this.buffer = new ArrayBuffer(0, { maxByteLength: max_byte_length });
    this.active_buffer_bytelength = 0;
    this.animation_objects = new Map();
    this.grouped_animation_objects = new Map();
    this.worker = new Worker(new URL("./worker.js", import.meta.url));
    window.addEventListener("unload", () => {
      this.worker.terminate();
    });
    window.addEventListener("beforeunload", () => {
      this.worker.terminate();
    });
    //      --> WORKER MESSAGES <--
    this.worker.onmessage = (ev) => {
      function try_to_set(index, value, setter) {
        try {
          // console.log(`index: ${index} val: ${value}`)
          setter.prop.updater(value, index);
        } catch (err) {
          console.error(
            `could not set value of animation ${index} -
callback: ${setter.prop.setter}
value: ${value}
error: ` + err
          );
          this.stop_animations([[index]]);
        }
      }
      if (ev.data.message == "render") {
        requestAnimationFrame(() => {
          try {
            ev.data.number_results.forEach((value, index) => {
              try_to_set(index, value, this.animation_objects.get(index));
            });
            ev.data.matrix_results.forEach((value, index) => {
              try_to_set(index, value, this.animation_objects.get(index));
            });
            ev.data.group_results.forEach((value, key) => {
              try {
                const prop = this.grouped_animation_objects.get(key).prop;
                prop.updater(value, key);
              } catch (err) {
                console.log(err);
                //this.stop_group.
              }
            });
          } catch (err) {
            this.stop_animations("all");
            console.error(
              "stopping all animations. There was am Error while stopping animations: " +
                err
            );
          }
        });
      } else if (ev.data.message == "render_constant") {
        this.constant_render_callbacks.get(ev.data.id).callback(ev.data.value);
        this.constant_map.get(ev.data.type).set(ev.data.id, ev.data.value);
      }
    };
  }
  clear_cache() {
    this.registry_map.clear();
    this.chain_map.clear();
    this.callback_map.clear();
    this.trigger_map.clear();
    this.matrix_chain_map.clear();
    this.trigger_map.clear();
    this.results.clear();
    this.spring_map.clear();
  }
  kill() {
    this.worker.terminate();
    this.clear_cache();
  }
  /**
   * Initializes the animator and sends all data to the worker. If autostart is true, it also starts the animation.
   * If the animator is already running, it will first stop the animation, reset the animations and then
   * sends the data to the worker.
   */
  init() {
    var ints = [
      "type",
      "duration",
      "render_interval",
      "delay",
      "smoothstep",
      "lerp_chain_start",
      "loop",
    ];
    this.registry_map.forEach((value, key) => {
      if (ints.includes(key)) {
        this.registry_map.set(
          key,
          add_to_buffer(this, "buffer", new Uint8Array(value))
        );
      }
    });
    this.registry_map.set(
      "delay_delta",
      add_to_buffer(
        this,
        "buffer",
        new Uint8Array(this.registry_map.get("delay").length)
      )
    );
    this.registry_map.set(
      "progress",
      add_to_buffer(
        this,
        "buffer",
        new Uint8Array(this.registry_map.get("delay").length)
      )
    );
    this.chain_map.forEach((value, key) => {
      if (key == "buffer" || key == "progress" || key == "lengths") {
        this.chain_map.set(
          key,
          add_to_buffer(this, "buffer", new Uint8Array(value))
        );
      }
    });
    ints = [
      "custom_delay",
      "sequence_length",
      "group_loop",
      "min_duration",
      "max_duration",
      "max_length",
      "uni_size",
    ];
    this.matrix_chain_map.forEach((value, key) => {
      if (ints.includes(key)) {
        this.matrix_chain_map.set(
          key,
          add_to_buffer(this, "buffer", new Uint8Array(value))
        );
      }
    });

    this.results.set(
      "number_results",
      add_to_buffer(
        this,
        "buffer",
        new Float32Array(this.results.get("number_results"))
      )
    );
    console.log(this.buffer.detached);
    this.worker.postMessage({
      method: "init",
      fps: this.fps,
      data: this.registry_map,
      chain_map: this.chain_map,
      results: this.results,
      trigger_map: this.trigger_map,
      constants: this.constant_map,
      callback_map: this.callback_map,
      spring_map: this.spring_map,
      matrix_chain_map: this.matrix_chain_map,
    });
    this.clear_cache();
  }
  /**
   * Updates the values of the lerp animations. The data is an array of objects with the following properties:
   * - id: The id of the lerp animation that should be updated.
   * - values: The new values of the lerp animation.
   * @param {Array<Object>} data - An array of objects with the properties id and values.
   */
  update_lerp(data) {
    this.worker.postMessage({ method: "update", type: 2, data: data });
  }
  /**
   * Calls a lambda function with the given id and arguments. The lambda function must be added to the animator via the Lambda class, or Animator.Lambda().
   * @param {number} id - The id of the lambda function that should be called.
   * @param {*} args - The arguments to pass to the lambda function.
   */
  lambda_call(id, args) {
    this.worker.postMessage({ method: "lambda_call", id: id, args: args });
  }
  /**
   * Updates the matrix lerp animations with new data.
   * Sends a message to the worker to update animations of type 3.
   * @param {Array<Object>} data - An array of objects with the properties id and values for the matrix lerp animation.
   */
  update_matrix_lerp(data) {
    this.worker.postMessage({ method: "update", type: 3, data: data });
  }
  /**
   * Creates a new lambda animation with the given condition and callback.
   * The callback is a function that is called when the condition is true.
   * The callback is called with the value of the lerp animation that triggered the condition.
   * @param {function(number):boolean} condition - A function that takes one argument, the value of the lerp animation and returns true if the condition is met.
   * @param {function(number)} callback - A function that takes one argument, the value of the lerp animation that triggered the condition.
   * @return {Lambda} The lambda animation that was created.
   */
  Lambda(condition, callback) {
    return new Lambda(this, condition, callback);
  }
  set_lambda(id, callback, condition = true) {
    this.worker.postMessage({
      method: "set_lambda",
      id: id,
      callback: callback,
      condition: condition,
    });
  }
  /**
   * Creates a new Lerp object.
   */
  Lerp(args) {
    return new Lerp(this, args);
  }
  /**
   * Create a Matrix_Lerp object.
   */
  Matrix_Lerp(args) {
    return new Matrix_Lerp(this, args);
  }
  /**
   * Create a Matrix_Lerp object.
   */
  Matrix_Chain(args) {
    return new MatrixChain(this, args);
  }
  /**
   * Creates a new Timeline object.
   */
  Timeline(args) {
    return new Timeline(this, args);
  }
  /**
   * Constant.
   * @param {string} type - the type of the constant can be number, matrix
   * @param { number | list } value - all lists will get merged to a map of float32 arrays, where numbers are one giant float32 array
   * @param { function } render_callback - a function that gets called when you call render_constant on the worker
   * @returns {dict } Constant - returns a instance of a Constant consisting of the id and value: {id:number, value:number|map}
   */
  constant(args) {
    return new Constant(this, args);
  }
  /**
   * Update multiple constants at once.
   * @param {Array} data - an array of objects containing the following properties:
   *  - type: the type of the constant (string)
   *  - id: the id of the constant to update (number)
   *  - value: the new value of the constant (number or list)
   */
  update_constant(data) {
    data.map((x) => {
      this.worker.postMessage({
        method: "update_constant",
        type: x.type,
        id: x.id,
        value: x.value,
      });
    });
  }
  /**
   * Start animations.
   * @param {number | number[]} indices - the index or indices of the animations to start.
   */
  start_animations(indices) {
    this.worker.postMessage({ method: "start_animations", indices: indices });
  }
  start_groups(
    indices,
    directions,
    reorientate = "progress",
    use_start_reference
  ) {
    this.worker.postMessage({
      method: "start_groups",
      indices: indices,
      directions: directions,
      reorientate: reorientate,
      use_start_reference: use_start_reference,
    });
  }
  stop_groups(indices) {
    this.worker.postMessage({ method: "stop_groups", indices: indices });
  }
  set_group_orientation(index, orientation) {
    this.worker.postMessage({
      method: "set_group_orientation",
      index: index,
      orientation: orientation,
    });
  }
  /**
   * Stop animations.
   * @param {number | number[]} indices - the index or indices of the animations to stop. If set to "all", stops all animations.
   */
  stop_animations(indices) {
    this.worker.postMessage({ method: "stop_animations", indices: indices });
  }
  /**
   * Reset animations.
   * @param {number | number[]} indices - the index or indices of the animations to reset. If set to "all", resets all animations.
   */
  reset_animations(indices) {
    this.worker.postMessage({ method: "reset_animations", indices: indices });
  }
  get_size() {
    return this.chain_map.get("progress").length;
    //return this.animation_objects.size
  }
  get_matrix_size() {
    return this.chain_map.get("lengths").size;
  }
  get_constant_size(type) {
    return this.constant_map.get(type).size;
  }
  /**
   * Stop the animation thread. This will pause all animations.
   */
  stop() {
    this.worker.postMessage({ method: "stop" });
  }
  /**
   * Start the animation thread. This will continue any animation that was running before
   * calling stop().
   */
  start() {
    this.worker.postMessage({ method: "start" });
  }
  /**
   * Changes the framerate of the animation thread.
   * @param {number} fps - the new framerate in frames per second
   */
  setFPS(fps) {
    this.worker.postMessage({ method: "change_framerate", fps_new: fps });
  }
  /**
   * Add a trigger to the animation with the given id.
   * @param {number} id - the id of the animation to add the trigger to
   * @param {number} target - the target id of the trigger
   * @param {number} step - the step at which the trigger should trigger
   * @param {number} time - the time at which the trigger should trigger
   */
  addTrigger(id, target, step, time) {
    this.worker.postMessage({
      method: "addTrigger",
      id: id,
      target: target,
      step: step,
      time: time,
    });
  }
  /**
   * Removes a trigger from the animation with the given id.
   * @param {number} id - the id of the animation to remove the trigger from
   * @param {number} target - the target id of the trigger to remove
   * @param {number} step - the step at which the trigger to remove should trigger
   * @param {number} time - the time at which the trigger to remove should trigger
   */
  removeTrigger(id, target, step, time) {
    this.worker.postMessage({
      method: "removeTrigger",
      id: id,
      target: target,
      step: step,
      time: time,
    });
  }
  set_group({ id, field, value, step }) {
    this.worker.postMessage({
      method: "set_group",
      id: id,
      field: field,
      value: value,
      step: step,
    });
  }
}
export { Prop, Animator, Lerp, Constant };

// if (ev.data.message == "finished") {
//     console.log('finished event:', ev);
//     // eslint-disable-next-line array-callback-return
//     ev.data.map((index) => {
//         this.obj = this.animation_objects.get(this.indexlist[index])
//         if (this.obj.callback) {
//             this.obj.callback()
//         }
//     })
// };

//deprecated
// waitForPromise(msg){
//     const promiseIndex = this.promises.length;
//     this.promises.push(null); // Platzhalter für den Promise

//     return new Promise((resolve) => {
//         this.worker.postMessage(msg);

//     });
// }

class lerpDiv {}
class Spring {
  constructor(animator, elements, duration, spring_tension, spring_whatever) {
    this.elements = elements;
  }
}
//    const ast = parse(callback, {
//     sourceType: 'module',
//     plugins: [    "jsx",
//         "flow"],
//   })

//   //  console.log(JSON.stringify(ast.program.body[1], null, 2));
//   const transform =   recast.visit(ast, {
//     visitCallExpression (path) {
//       let node = path.node;
//         console.log(node)
//         if (node.type === 'ExpressionStatement') {
//         if(node.loc.tokens.includes("kooljs_worker__WEBPACK_IMPORTED_MODULE_1__")){
//             const index=node.loc.tokens.indexOf("kooljs_worker__WEBPACK_IMPORTED_MODULE_1__")

//         }
//           var lastIndex=0
//           node.loc.tokens=node.loc.tokens.reverse().filter((x,i)=>{
//             console.log(x.value)
//             if(x.value==="kooljs_worker__WEBPACK_IMPORTED_MODULE_1__"){
//             lastIndex=i
//                 return false
//           }else if(lastIndex===i-1&&x.value==="."){
//               return false
//           }
//         }).reverse()
//         console.log(node.loc.tokens,)
//         }
//         this.traverse(path);

//       },
//   });
// old lambda approaches
// for (let i = 0; i < import_strings.length; i++) {
//     callback = callback.replace(import_strings[i], worker_functions[i]);
//   }
// worker_functions.map((x)=>{
//     console.log(`(0,kooljs_worker__WEBPACK_IMPORTED_MODULE_1__.${x})`);
//     callback = callback.replace(new RegExp(`\\(0,kooljs_worker__WEBPACK_IMPORTED_MODULE_1__.${x}\\)`, 'g'), x);
// })

// //  console.log(replaced_callback);

// const ast = parse(callback.toString(), {
//     sourceType: 'script',
//     plugins: ['jsx'],
//   })
//   const getMatrixCalls = [];
// console.log( ast)
// function traverse(node) {
//     console.log("----------------")
//     console.log(node.name)
//     console.log(node.type);
//     console.log(node)

//   if(node.callee){
//     console.log(node.callee.name)
//   }
//     if (node.type === 'CallExpression') {
//       if (node.callee.name === 'getMatrix') {
//         const args = node.arguments;
//         const argString = args.map((arg) => arg.value).join(', ');
//         getMatrixCalls.push(`getMatrix(${argString})`);
//       }
//     }
//     if (node.body) {
//       node.body.map((child) => {
//         traverse(child);
//       });
//     }

//     if (node.expression) {
//       traverse(node.expression);
//     }

//     if (node.arguments) {
//       node.arguments.forEach((arg) => {
//         traverse(arg);
//       });
//     }

//     if (node.expressions) {
//       node.expressions.forEach((expr) => {
//         traverse(expr);
//       });
//     }
//   }
//   traverse(ast.program.body[0].expression.body);

// ast.program.body[0].expression.body.body.forEach((statement) => {
//     console.log(statement)
//     if (statement.type === 'ExpressionStatement' && statement.expression.type === 'CallExpression') {
//     const callee = statement.expression.callee;
//     if (callee.type === 'Identifier' && callee.name === 'getMatrix') {
//     const args = statement.expression.arguments;
//     const argString = args.map((arg) => arg.value).join(', ');
//     getMatrixCalls.push(`getMatrix(${argString})`);
//     }
// }
// });
