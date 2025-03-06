// Copyright (c) 2025 Ji-Podhead and Project Contributors
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the following conditions:
// 1. All commercial uses of the Software must:
//    a) Include visible attribution to all contributors (listed in CONTRIBUTORS.md).
//    b) Provide a direct link to the original project repository (https://github.com/ji-podhead/kooljs).
// 2. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
import { Worker_Utils } from "kooljs/worker_utils";
var triggers_step, animator, active_index, triggers_step
// ----------------------------------------> CLASS DEFINITIONS <--
class Lerp extends Worker_Utils {
    constructor(results, callback_map, type, duration, render_interval, delay, delay_delta, progress, smoothstep, lerp_chain_start, loop, group, group_lookup, lerp_callback_ids) {
        super()
        this.type = type
        this.duration = duration
        this.matrix_chain_groups = undefined
        this.render_interval = render_interval
        this.delay_delta = delay_delta
        this.delay = delay
        this.progress = progress
        this.smoothstep = smoothstep
        this.matrix_chain_registry = undefined
        this.lerp_chain_start = lerp_chain_start
        this.loop = loop
        this.group = group
        this.group_lookup = group_lookup
        this.active_groups = new Set()
        this.active_group_indices = new Map()
        this.active_timelines = new Set()
        this.active_matrices = new Set()
        this.active_numbers = []
        this.active_group_indices_render = new Map()
        this.group_results_render = new Map()
        this.matrix_results_render = new Map()
        this.number_results_render = new Map()
        this.matrix_results = results.get("matrix_results")
        this.number_results = results.get("number_results")
        this.group_results = new Map()
        this.lerp_callbacks = new Map();
        this.loop_resolver = null;
        lerp_callback_ids.forEach((val, key) => {
            // no shallow copy just copying the pointer
            this.lerp_callbacks.set(key, callback_map.get(val));
        });
    }
    activate(id) {
        switch (this.type[id]) {
            case (2):
                if (this.active_numbers.includes(id) == false) {
                    this.active_numbers = Uint8Array.from([...this.active_numbers, id])
                    this.number_results_render.delete(id)
                    return false
                }
                else {
                    return true
                }
            case (3):
                //if(this.group.has(id)!=true){
                if (this.active_matrices.has(id) == false) {
                    this.active_matrices.add(id)
                    this.matrix_results_render.set(id, new Map())

                    return false
                }
                else {
                    return true
                }
            case (4):
                if (this.active_timelines.has(id) == false) {
                    this.active_timelines.add(id)
                    return false
                }
                else {
                    return true
                }
        }
    }
    delete_group_member(id) {
        if (this.group.has(id)) {
            const group = this.group.get(id)
            if (this.active_groups.has(group)) {
                this.active_group_indices.get(group).delete(id)
                this.group_results_render.get(group).delete(this.group_lookup.get(id))
                if (this.active_group_indices.get(group).size == 0) {
                    this.matrix_chain_registry.update_group(group)
                }
                return true
            }
            return false
        }
        else { return false }
    }
    deactivate(id) {
        switch (this.type[id]) {
            case (3):
                if (this.delete_group_member(id) == false) {
                    this.active_matrices.delete(id);
                    this.matrix_results_render.delete(id);
                }
                break
            case (2):
                active_index = this.active_numbers.indexOf(id)
                this.active_numbers = Uint8Array.from([...this.active_numbers.slice(0, active_index), ...this.active_numbers.slice(active_index + 1, this.active_numbers.length)])
                this.number_results_render.delete(id)

                break
            case (4):
                this.active_timelines.delete(id);
        }
    }
    stop_all() {
        this.active_numbers = []
        this.active_matrices.clear()
        this.active_timelines.clear()
        this.active_groups.clear()
        this.active_groups.forEach((val, key) => {
            this.active_group_indices.get(key).clear()
        })
        this.group_results_render.clear()
        this.matrix_results_render.clear()
        this.number_results_render.clear()
        // this.active_group_indices.forEach((val, key) => {
        //     this.active_group_indices.set(key, [])
        // })
    }
}
const default_target_step = [0, 1]
var final_step, final_sub_step;
class LerpSequence extends Worker_Utils {
    /**
     * The constructor for the LerpChain class.
     * Initializes properties related to the state and progress of the lerp chain.
     *
     * @property {Array|undefined} buffer - The buffer holding the chain data.
     * @property {Map|undefined} matrixChains - The map containing matrix chains.
     * @property {Array|undefined} progress - The progress of each chain.
     * @property {Array|undefined} lengths - The lengths of each chain.
     */
    constructor(buffer, matrix_sequences, progress, lengths, animator) {
        super()
        this.buffer = buffer
        this.matrix_sequences = matrix_sequences
        this.progress = progress
        this.lengths = lengths
        this.lerp_registry = animator.lerp_registry
    }
    update_progress(id) {
        if (this.progress[id] == this.lengths[id] - 1) {
            this.stop_animations([id])
        } else {
            this.reset_and_update(id);
            return false;
        }
    }
    reset_and_update(id) {
        this.lerp_registry.delay_delta[id] = 0;
        this.lerp_registry.progress[id] = 0;
        this.progress[id] += 1;
    }
    reset(id) {
        switch (this.lerp_registry.type[id]) {
            case (2):
                this.lerp_registry.number_results[id] = this.buffer[this.lerp_registry.lerp_chain_start[id]]
                break
            case (3):
                if (!this.lerp_registry.group.get(id))
                    this.lerp_registry.matrix_results.set(
                        id,
                        this.matrix_sequences.get(id).get(0)
                    );
                break
        }
        this.lerp_registry.delay_delta[id] = 0;
        this.lerp_registry.progress[id] = 0;
        this.progress[id] = 0;
    }
    soft_reset(id) {
        if (this.lerp_registry.activate(id) == false) {
            final_step = this.progress[id] == this.lengths[id] - 1;
            final_sub_step = this.lerp_registry.progress[id] >= this.lerp_registry.duration[id];
            if (final_step && final_sub_step) {
                this.reset(id);
            } else if (final_sub_step) {
                this.reset_and_update(id);
            }
        }
    }
}
var indices
class Matrix_Chain extends Worker_Utils {
    constructor(indices, ref_matrix, uni_size,orientation_step, max_duration, min_duration, custom_delay,  group_loop, max_length, sequence_length, animator) {
        super()
        this.indices = indices;
        this.ref_matrix = ref_matrix;
        this.orientation_step = orientation_step
        this.max_duration = max_duration;
        this.min_duration = min_duration;
        this.uni_size=uni_size
        this.max_length = max_length
        this.custom_delay = custom_delay;
        this.progress = new Uint8Array(indices.size).fill(0, 0, indices.length)
        this.sequence_length = sequence_length
        this.lerp_registry = animator.lerp_registry
        this.group_loop = group_loop
        this.sequence_registry = animator.sequence_registry
        this.constant_registry = animator.constant_registry
        this.lerp_registry = animator.lerp_registry
        this.start_loop = animator.start_loop
        this.callback_map = animator.callback_map
        this.result_map = new Map()
        indices.forEach((val, i) => {
            this.lerp_registry.active_group_indices.set(i, new Set())
            this.lerp_registry.group_results.set(i, new Map())
            val.map((group, i2) => {
                this.lerp_registry.group_results.get(i).set(i2, ref_matrix.get(i).get(i2))
            })
        })
    }
    reorient_matrix_chain({ id, target_step, direction,reorientate }) {
        var indices = this.indices.get(id)
        indices.map((index, i) => {
            var ref = this.ref_matrix.get(id)
            var start_ref
            const current = this.get_lerp_value(index);
            var base
            if(this.uni_size[id]==1){
                base=0
            }
            else{
                base = i * this.max_length[id]
            }
            this.lerp_registry.active_group_indices.get(id).add(index)
            if (reorientate!="progress")  {
                start_ref = ref.get(target_step[direction==1?0:1] + base);
            }
            ref = ref.get(target_step[direction] + base);
            if (ref == current) {
                return console.log("target animation is reachead");
            }
            this.hard_reset(index);
            if(reorientate)this.reorient_target({
                index: index,
                step: 0, // this is alway zero, since the matrix itself has a steplength of 2, but the ref matrix lnegth can be bigger
                direction: 1,
                matrix_row: 0,
                verbose: false,
                reference: ref,
                start_reference: start_ref

            });
            if (this.custom_delay[id] !=255) {
                const delay = (this.lambda_call(this.custom_delay[id], { animation_index: index, index: i, indices: indices, progress:this.progress[id],direction: direction, target_step: target_step }) || 0)
                this.set_delay(index, delay);
            }
            if(reorientate=="progress")this.reorient_duration_by_progress({
                index: index,
                min_duration: this.min_duration[id],
                max_duration: this.max_duration[id],
                soft_reset: false
            });
        });
    }
    /**
     * Resets a group of animations.
     * @param {number} id - The id of the group.
     */
    reset_group(id,start,target){ 
                if(start!=undefined){
                    if (start==target|| this.ref_matrix.get(id).get(start)==undefined || this.ref_matrix.get(id).get(target)==undefined) {
                        return console.log("start or target is not valie");
                    }
                    var indices = this.indices.get(id)
                        indices.map((index, i) => {
                            var target_ref = this.ref_matrix.get(id)
                            var start_ref
                            var base
                            if(this.uni_size[id]==1){
                                base=0
                            }
                            else{base = i * this.max_length[id]}
                            start_ref = target_ref.get(start + base);
                            target_ref = target_ref.get(target + base);

                            this.hard_reset(index);
                            this.setMatrix(index, 0, start_ref);
                            this.setMatrix(index, 1, target_ref);
                        });
                    
                }else{
                    indices.map((index, i) => {
                    this.hard_reset(index);
                    })
                }
    }
    start_matrix_chain(direction, id,reorientate="progress") {
        this.result_map.clear()
        const target= this.orientation_step.get(id)// ? this.orientation_step.get(id) : default_target_step[direction == 0 ? 1 : 0]
        this.lerp_registry.group_results_render.set(id, this.result_map)
        //this.lerp_registry.active_group_indices_render.set(id,this.lerp_registry.active_group_indices.get(id))
        this.reorient_matrix_chain({
            id: id,
            direction: direction,
            target_step: target,
            reorientate:reorientate,
        })
        this.lerp_registry.active_groups.add(id)
    }
    group_set( id) {
        // this.progress.set(id,progress)
        
        const ref = this.ref_matrix.get(id)
        this.indices.get(id).map((index, i) => {
            var base
            if(this.uni_size[id]==1){
                base=0
            }
            else{
                base = i * this.max_length[id]
            }
            const start_index = base + this.progress[id]
            const end_index = base + this.progress[id] + 1
            const start = ref.get(start_index)
            const end = ref.get(end_index)

            this.setMatrix(index, 0, start)
            this.setMatrix(index, 1, end)
            this.lerp_registry.active_group_indices.get(id).add(index)
            this.hard_reset(index)
        })
        
    }
    update_group(id) {
        this.progress[id] += 1
        if (this.progress[id] >= this.sequence_length[id]) {
            this.progress[id] = 0
            if (this.group_loop[id] == 1) {
                this.orientation_step.set(id, [0, 1])
                if (this.sequence_length[id] == 1) {
                    this.start_matrix_chain(1, id,true)
                }
                else {
                    this.group_set(id)
                }
            }
            else {
                this.lerp_registry.active_groups.delete(id)
            }
        }
        else {
             this.group_set(id)
        }
    }
}
class Constant extends Worker_Utils {
    constructor(constants, animator) {
        super()
        this.reg = new Map()
        this.reg.set("matrix", new Map())
        this.reg.set("number", undefined)
        this.render_triggers = new Map();
        this.render_callbacks = new Map();
        this.animator = animator
        if (constants.get("matrix") != undefined) {
            constants.get("matrix").forEach((val, i) => {
                this.reg.get("matrix").set(i, new Map());
                val.map((m, i2) => {
                    this.reg.get("matrix").get(i).set(i2, new Float32Array(m));
                });
            });
        }
        if (constants.get("number") != undefined) {
            this.reg.set("number", constants.get("number"))
        }
        this.render_triggers = constants.get("render_triggers");
        this.render_callbacks = constants.get("render_callbacks");
    }
    update(type, id, value) {
        //["matrix","number"].includes["type"]&&this.reg.get(type).has(id)&&
        this.reg.get(type).set(id, value);
        if (this.render_callbacks.has(id))
            this.render_callbacks.get(id).map((l) => {
                this.animator.callback_map.get(l.id)(l.args);
            });
        if (this.render_triggers.has(id))
            this.animator.start_animations(this.render_triggers.get(id));
    }
    get(type, index, row) {
        if (row != undefined) {
            this.get_row(index, row);
        } else return this.reg.get(type).get(index);
    }
    get_row(index, row) {
        return this.reg.get("matrix").get(index).get(row);
    }
    get_number(index) {
        return this.reg.get("number").get(index);
    }
}
// ----------------------------------------> ANIMATION <--
var t;
var targets, allow_render, args, delta_t, res
var startTime, timeoutId
var indices, buffer
function smoothLerp(min, max, v, amount) {
    t = smoothstep(v);
    //  t=(t*amount)/t
    return max * t + min * (1 - t);
}
function smoothstep(x) { return x * x * (3 - 2 * x) }
class Animator extends Worker_Utils {
    constructor(new_fps, lerps, lerpChains, results, triggers, constants, condi_new, matrix_chains, springs) {
        super()
        this.fps = new_fps;
        // this.buffer = buffer.transfer(buffer.byteLength);
        // this.result_buffer = result_buffer;
        this.callback_map = new Map();
        this.trigger_registry = new Map();
        this.callback_map = new Map();
        this.update_group = undefined
        triggers.forEach((trigger, key) => this.trigger_registry.set(key, trigger));
        condi_new.forEach((val, key) => {
            try {
                this.callback_map.set(key, eval(val));
            } catch (err) {
                console.error(
                    "failed to eval callback function on the worker for: " + key
                );
                console.error(val);
                console.error(err);
            }
        });
        this.lerp_registry = new Lerp(
            results,
            this.callback_map,
            lerps.get("type"),
            lerps.get("duration"),
            lerps.get("render_interval"),
            lerps.get("delay"),
            lerps.get("delay_delta"),
            lerps.get("progress"),
            lerps.get("smoothstep"),
            lerps.get("lerp_chain_start"),
            lerps.get("loop"),
            lerps.get("group"),
            lerps.get("group_lookup"),
            lerps.get("lerp_callbacks"),
            this
        )
        this.sequence_registry = new LerpSequence(
            lerpChains.get("buffer"),
            lerpChains.get("matrix_buffer"),
            lerpChains.get("progress"),
            lerpChains.get("lengths"),
            this
        )
        this.matrix_chain_registry = new Matrix_Chain(
            matrix_chains.get("indices"),
            matrix_chains.get("ref_matrix"),
            matrix_chains.get("uni_size"),
            matrix_chains.get("orientation_step"),
            matrix_chains.get("max_duration"),
            matrix_chains.get("min_duration"),
            matrix_chains.get("custom_delay"),
            matrix_chains.get("group_loop"),
            matrix_chains.get("max_length"),
            matrix_chains.get("sequence_length"),
            this
        )
        this.update_group = this.matrix_chain_registry.update_group
        this.lerp_registry.matrix_chain_registry = this.matrix_chain_registry
        this.start_matrix_chain = this.matrix_chain_registry.start_matrix_chain
        this.lerp_registry.matrix_chain_registry = this.matrix_chain_registry

        this.constant_registry = new Constant(constants, this)
        this.animateLoop = async function () {
            try {
                this.loop_resolver = new AbortController();
                this.loop_resolver.signal.addEventListener("abort", () => {
                    clearTimeout(timeoutId);
                });
                while (this.loop_resolver.signal.aborted == false) {
                    startTime = performance.now();
                    this.lerp_registry.active_timelines.forEach((id) => this.animate(id))
                    this.lerp_registry.active_numbers.map((id, i) =>
                        this.animate(id, this.animate_number, this.lerp_registry.number_results, 2, i))
                    this.lerp_registry.active_matrices.forEach((id) => this.animate(id, this.animate_matrix, this.lerp_registry.matrix_results, 3))
                    this.lerp_registry.active_groups.forEach((group_id) => {
                        this.lerp_registry.active_group_indices.get(group_id).forEach((id, i) => { this.animate(id, this.animate_matrix, this.lerp_registry.matrix_results, 0, group_id, i) })
                    })
                    this.render();
                    if (this.lerp_registry.active_groups.size > 0
                        || this.lerp_registry.active_timelines.size > 0
                        || this.lerp_registry.active_matrices.size > 0
                        || this.lerp_registry.active_numbers.length > 0
                    ) {
                        await new Promise((resolve, reject) => {
                            timeoutId = setTimeout(() => {
                                resolve();
                            }, Math.max(0, this.fps - (performance.now() - startTime)));
                        });
                    } else {
                        return this.stop_loop();
                    }
                }
            } catch {
                (err) => {
                    this.stop_loop();
                    this.stop_animations("all");
                    return Error("had a error during animation. stoppingloop! " + err);
                };
            }
        }
        this.animate_matrix = ((id, delta_t, target) => {
            //lookup = this.lerp_registry.a.get(id) != undefined ? this.lerp_registry.group_lookup.get(id) : id
            for (let i = 0; i < this.sequence_registry.matrix_sequences.get(id).get(this.sequence_registry.progress[id]).length; i++) {
                target.get(id)[i] = smoothLerp(
                    this.sequence_registry.matrix_sequences
                        .get(id)
                        .get(this.sequence_registry.progress[id])[i],
                    this.sequence_registry.matrix_sequences
                        .get(id)
                        .get(this.sequence_registry.progress[id] + 1)[i],
                    delta_t,
                    this.lerp_registry.smoothstep[id]
                );
            }
        })
        this.animate_number = ((id, delta_t, target, render_index) => {
            target[id] = smoothLerp(
                this.sequence_registry.buffer[
                this.lerp_registry.lerp_chain_start[id] +
                this.sequence_registry.progress[id]
                ],
                this.sequence_registry.buffer[
                this.lerp_registry.lerp_chain_start[id] +
                this.sequence_registry.progress[id] +
                1
                ],
                delta_t,
                this.lerp_registry.smoothstep[id]
            )
            this.lerp_registry.number_results_render.set(id, target[id])

        })
        this.animate = async function (index, method, target, type, reference) {
            if (this.lerp_registry.progress[index] <= this.lerp_registry.duration[index]) {
                if (this.lerp_registry.delay_delta[index] < this.lerp_registry.delay[index] - 1) {
                    this.lerp_registry.delay_delta[index] += 1;
                }
                else if (this.lerp_registry.delay_delta[index] == 0 || (this.lerp_registry.delay_delta[index] < this.lerp_registry.delay[index])) {
                    this.lerp_registry.delay_delta[index] += 1;
                    if (method != undefined) {
                        switch (type) {
                            case (0):
                                this.lerp_registry.group_results_render.get(reference).set(this.lerp_registry.group_lookup.get(index), this.lerp_registry.matrix_results.get(index))
                                break
                            case (2):
                                this.lerp_registry.number_results_render.set(index, this.lerp_registry.number_results[index])
                                break;
                            case (3):
                                this.lerp_registry.matrix_results_render.set(index, this.lerp_registry.matrix_results.get(index))
                                break
                        }
                    }
                }
                else {
                    allow_render = this.lerp_registry.progress[index] % this.lerp_registry.render_interval[index];
                    if (allow_render == 0) {
                        delta_t = this.lerp_registry.progress[index] / this.lerp_registry.duration[index];
                        if (method != undefined) res = method(index, delta_t, target, reference)
                        args = {
                            id: index,
                            value: res,
                            step: this.sequence_registry.progress[index],
                            time: this.lerp_registry.progress[index],
                            step: this.sequence_registry.progress[index],
                        };
                        if (this.lerp_registry.lerp_callbacks.has(index)) {
                            try {
                                this.lerp_registry.lerp_callbacks.get(index)(args);
                            }
                            catch (err) { console.error(`got Error calling lambda number: ${index} 
Function: ${this.lerp_registry.lerp_callbacks.get(index)}
args: ${JSON.stringify(args)}
error: ${err}
-------------
stopping animator now!
                                `)
                                this.stop_animations("all");
                            }
                        }
                    }
                    this.lerp_registry.progress[index] += 1;
                    if (allow_render == 0) {
                        triggers_step =
                            this.trigger_registry.get(index) != undefined
                                ? this.trigger_registry.get(index).get(this.sequence_registry.progress[index])
                                : undefined;
                        if (triggers_step != undefined) {
                            targets = triggers_step.get(this.lerp_registry.progress[index] - 1);
                            targets && targets.map((target) => {
                                if (target == index) {
                                     this.hard_reset(target); this.lerp_registry.number_results_render.delete }
                                else this.soft_reset(target);

                            });
                        }
                    }
                }
            }
            else { this.sequence_registry.update_progress(index) }
        }
        this.render = () => {
            postMessage(
                {
                    message: "render",
                    number_results: this.lerp_registry.number_results_render,
                    matrix_results: this.lerp_registry.matrix_results_render,
                    group_results: this.lerp_registry.group_results_render,
                },
            )
            //this.result_buffer = result_buffer.transfer(result_buffer.byteLength);
        }
    }
}
var const_map_new;
onmessage = (event) => {
    switch (event.data.method) {
        case "init":
            animator = new Animator(
                event.data.fps,
                event.data.data,
                event.data.chain_map,
                event.data.results,
                event.data.trigger_map,
                event.data.constants,
                event.data.callback_map,
                event.data.matrix_chain_map,
                event.data.spring_map
            );
            break;
        case "update":
            animator.update(event.data.type, event.data.data);
            break;
        case "update_constant":
            if (event.data.type == "matrix") {
                const_map_new = new Map();
                event.data.value.map((val, i) => {
                    if (typeof val != "") {
                        event.data.value[i] = new Float32Array(val);
                    }
                    const_map_new.set(i, event.data.value[i]);
                });
                animator.constant_registry.update(event.data.type, event.data.id, const_map_new);
            } else {
                animator.constant_registry.update(
                    event.data.type,
                    event.data.id,
                    event.data.value
                );
            }
            break;
        case "start":
            animator.start_loop();
            break;
        case "set_lambda":
            animator.callback_map.set(event.data.id, eval(event.data.callback));
            break;
        case "stop":
            animator.stop_loop();
            break;
        case "change_framerate":
            animator.change_framerate(event.data.fps_new);
            break;
        case "lambda_call":
            animator.lambda_call(event.data.id, event.data.args);
            break;
        case "start_animations":
            animator.start_animations(event.data.indices);
            break;
        case "stop_animations":
            animator.stop_animations(event.data.indices);
            break;
        case "start_groups":
            animator.start_group(event.data.directions, event.data.indices,event.data.reorientate,event.data.use_start_reference);
            break;
        case "stop_groups":
            animator.stop_group(event.data.indices);
            break;
        case "set_group_orientation":
            animator.set_group_orientation(event.data.index, event.data.orientation);
            break;
        case "reset_animations":
            animator.reset_animations(event.data.indices);
            break;
        case "set_group":{
            animator.set_group_values(event.data.id, event.data.field,  event.data.value,event.data.step);
        }
        case "addTrigger":
            animator.addTrigger({
                id: event.data.id,
                target: event.data.target,
                step: event.data.step,
                time: event.data.time
            }
            );
            break;
        case "removeTrigger":
            animator.removeTrigger({
                id: event.data.id,
                target: event.data.target,
                step: event.data.step,
                time: event.data.time
            }
            );
            break;
        default:
            console.warn("no method selected during worker call");
            break;
    }
};
// ----------------------------------------> REQUIRES IMPLEMENTATION <--

class Spring {
    constructor(elements, duration, spring_tension, spring_whatever) {
        this.elements = elements;
        this.duration = duration;
        this.spring_tension = spring_tension;
    }
}
//dijkstra algo für matrix
function shortest_path() { }
// k nearest neigbor for matrix (not sure if also for lerp)
function knn() { }
//matrix and callback for lerp
function convex_hull() { }
function spring() { }
export {
    Animator as animator, Lerp, Matrix_Chain, Constant, LerpSequence
}

// this has to commented out when creating the docs

//t = callback_registry.callback.get(val)?.(val, t) ?? undefined; //  Null-Coalescing-Operator -- if callback not undefined then use and process the value t for callback
// const eslapsed = performance.now() - startTime;
// const waitTime = Math.max(0, fps - elapsed);
// postMessage({
//     message: "finish",
//     results: this.lerp_registry.results,
//     result_indices: this.lerp_registry.activelist
// });
// function triggers() {
//     postMessage({ message: "trigger", results: this.lerp_registry.results, result_indices: this.lerp_registry.activelist })
// }

//v = Math.floor(registry.progress[val] / registry.duration[val]);

// function calculateSpringAnimation(matrix, params) {
//     const { mass, tension, friction, bounce, damping, decay, duration, velocities } = params;

//     return matrix.map((value, index) => {
//       const initialValue = value;
//       const targetValue = params.targetValues ? params.targetValues[index] : initialValue;

//       const k = 2 * Math.PI * Math.sqrt(tension / mass);
//       const zeta = damping / (2 * mass);
//       const omega = k * Math.sqrt(1 - zeta * zeta);

//       return (t) => {
//         const x = targetValue - initialValue;
//         const theta = omega * t;

//         let y;
//         if (zeta < 1) {
//           // Unter- oder kritisch gedämpft
//           y = x * Math.exp(-zeta * theta) * (Math.cos(theta) + (zeta / omega) * Math.sin(theta));
//         } else {
//           // Überdämpft
//           y = x * Math.exp(-omega * t);
//         }

//         // Bounce-Effekt hinzufügen
//         const bounceFactor = Math.pow(0.9, t / duration);
//         y *= bounceFactor;

//         // Auslaufwert berücksichtigen
//         return targetValue + (y - targetValue) * Math.exp(-decay * t);
//       };
//     });
//   }

//   // Beispielaufruf:
//   const matrix = [10, 20, 30, 40, 50];
//   const params = {
//     mass: 0.5,
//     tension: 100,
//     friction: 0.05,
//     bounce: 0.9,
//     damping: 0.15,
//     decay: 0.001,
//     duration: 1000,
//     velocities: [0, 0, 0, 0, 0],
//     targetValues: [15, 25, 35, 45, 55]
//   };

//   const animations = calculateSpringAnimation(matrix, params);
