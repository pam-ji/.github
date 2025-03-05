// Copyright (c) 2025 Ji-Podhead and Project Contributors
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to the following conditions:
// 1. All commercial uses of the Software must:
//    a) Include visible attribution to all contributors (listed in CONTRIBUTORS.md).
//    b) Provide a direct link to the original project repository (https://github.com/ji-podhead/kooljs).
// 2. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

var type,trigger,newtriggers
var group,distance, duration;
class Worker_Utils{


/**
 * Adds a trigger to the trigger registry.
 * If the trigger does not exist at the given time and step in the given animation, it is created.
 * If the trigger does exist, the target is added to the existing trigger.
 * @param {number} id - The id of the animation to add the trigger to.
 * @param {number} target - The target of the trigger.
 * @param {number} step - The step of the trigger.
 * @param {number} time - The time of the trigger.
 */
 addTrigger({id, target, step, time}) {
    if (this.trigger_registry.get(id) == undefined) {
        this.trigger_registry.set(id, new Map());
    }
    if (this.trigger_registry.get(id).get(step) == undefined) {
        this.trigger_registry.get(id).set(step, new Map());
        this.trigger_registry
            .get(id)
            .get(step)
            .set(time, new Uint8Array([target]));
    } else if (this.trigger_registry.get(id).get(step).get(time) == undefined) {
        this.trigger_registry
            .get(id)
            .get(step)
            .set(time, new Uint8Array([target]));
    } else {
        trigger = this.trigger_registry.get(id).get(step).get(time);
        if (trigger.includes(target) == false) {
             newtriggers = new Array(trigger);
            newtriggers.push(target);
            newtriggers = new Uint8Array(newtriggers);
            this.trigger_registry.get(id).get(step).set(time, newtriggers);
        } else {
            console.warn(
                `trigger already exists: target ${target} in timeframe ${time} in step ${step} on animation with id ${id}`
            );
        }
    }
}
/**
 * Removes a trigger from the trigger registry.
 * If the trigger does not exist at the given time and step in the given animation, a warning is printed.
 * If the trigger does exist, the target is removed from the existing trigger.
 * If the trigger is empty after removal (i.e. it only contained the target), the trigger is removed.
 * @param {number} id - The id of the animation to remove the trigger from.
 * @param {number} target - The target of the trigger.
 * @param {number} step - The step of the trigger.
 * @param {number} time - The time of the trigger.
 */
 removeTrigger({id, target, step, time}) {
    trigger = this.trigger_registry.get(id).get(step)
    if (trigger != undefined) {
        if (trigger.get(time) != undefined) {
            trigger = trigger.get(time);
        } else {
            return console.warn(
                "the slected timeframe in the  step does not include the target"
            );
        }
    } else {
        return console.warn("the trigger registr has does not include the step");
    }
    const targetId = trigger.indexOf(target);
    if (targetId != undefined && trigger.length > 1) {
        const newtriggers = new Uint8Array(new Array(trigger).splice(targetId, 1));
        console.log(
            `removed trigger target ${target} in timeframe ${time} in step ${step} from from id ${id}`
        );
        this.trigger_registry.get(id).get(step).set(time, newtriggers);
    } else {
        this.trigger_registry.get(id).get(step).set(time, undefined);
    }
    // else{
    //     this.trigger_registry.get(id).set(step,undefined)
    // }
}
 update(type, values) {
    values.map((x) => {
        if (this.sequence_registry.lengths[x.id] != x.values.length - 1) {
            if (this.lerp_registry.loop[x.id] == 1) {
                this.removeTrigger(
                   {id:x.id,
                    target:x.id,
                    step:this.sequence_registry.lengths[x.id] - 1,
                    time:this.lerp_registry.duration[x.id]}
                );
                this.addTrigger(
                    {
                    id:x.id,
                    target:x.id,
                    step:x.values.length - 2,
                    time:this.lerp_registry.duration[x.id]}
                );
                //this.trigger_registry.get(x.id).set(lerpChain_registry.lengths[x.id]-1,undefined)
            }
            this.sequence_registry.lengths[x.id] = x.values.length - 1;
        }
        if (type == 2) {
            x.values.map((val, i) => {
                this.sequence_registry.buffer[this.lerp_registry.lerp_chain_start[x.id] + i] =
                    val;
            });
        } else if (type == 3) {
            x.values.map((val, i) => {
                this.sequence_registry.matrix_sequences.get(x.id).set(i, val);
            });
        }
        this.sequence_registry.reset(x.id);
    });
}

/**
 * Calls a lambda  stored in callback_map with the given id and arguments.
 * @param {number} id - The id of the lambda  to call
 * @param {any[]} args - The arguments to pass to the lambda 
 */
 lambda_call(id, args) {
    try {
        // console.log(args)
        // console.log(id)
        return this.callback_map.get(id)(args);
    } catch (err) {
        console.error("error in lambda call", id);
        console.error(this.callback_map.get(id));
        console.error(err);
    }
}
// ----------------------------------------> EVENTS <--


 start_loop() {
    if (this.loop_resolver == null) {
        this.animateLoop();
    }
}
stop_loop() {
    if (this.loop_resolver != null) {
        this.loop_resolver.abort();
        this.loop_resolver = null;
    }
}
/**
 * starts a list of animations
 * @param {Array<number>} indices an array of ids of the animations to start
 */
  start_animations(indices) {
    indices.map((id) => {
        this.lerp_registry.delete_group_member(id)
        this.sequence_registry.soft_reset(id);
    });
    this.start_loop();
}
/**
 * stops a list of animations
 * @param {Array<number>|string} indices an array of ids of the animations to stop; if "all", stops all animations
 */

  stop_animations(indices) {
    if (indices === "all") {
        this.lerp_registry.stop_all();
        this.stop_loop();
    }
    else {
        indices.map((id) => {
            this.lerp_registry.deactivate(id);
        });
    
    if (this.lerp_registry.active_numbers.length == 0&&
        this.lerp_registry.active_timelines.size == 0&&
        this.lerp_registry.active_matrices.size == 0&&
        this.lerp_registry.active_groups.size == 0
    ) {
        this.stop_loop();
    }
}
}
/**
 * Resets a list of animations.
 *
 * If "all" is passed, stops the animation loop and resets all active animations.
 * Otherwise, resets each animation in the provided indices, re-activates it, and
 * updates the results based on its type. If any animations were stopped and reset,
 * a render message is posted with the updated results.
 *
 * @param {Array<number>|string} indices - An array of animation IDs to reset, or "all" to reset all animations.
 */

    reset_animations(indices) {
    if (indices == "all") {
        if(this.sequence_registry!=undefined){this.sequence_registry.stop_loop()}
        else {this.stop_loop()}
        indices = this.lerp_registry.type.map((t,i)=>{return i});
    }
    //stop_animations(indices)
    var stopped=0
    const results={ 
        number_results: new Map(),
        matrix_results: new Map(),
    }
    //this.sequence_registry.hard_reset(indices);
    indices.map((x) => {
        this.sequence_registry.reset(x);
        this.lerp_registry.activate(x);
            
            switch (this.lerp_registry.type[x]) {
                case 2:
                    results.number_results.set(x,this.sequence_registry.buffer[this.lerp_registry.lerp_chain_start[x]])
                    stopped+=1
                    break;
                case 3:
                        results.matrix_results.set(
                            x,
                            this.sequence_registry.matrix_sequences.get(x).get(0)
                        );
                        stopped+=1
                    break;
                default:
                    break;
            }
    });
    if ( this.loop_resolver == null&&stopped> 0)
        postMessage({
            message: "render",
            number_results: results.number_results,
            matrix_results: results.matrix_results,
        });
}
/**
 * Changes the framerate of the animation loop.
 *
 * @param {number} fps_new - The new framerate in frames per second.
 */
  change_framerate(fps_new) {
    this.fps = fps_new;
}
/**
 * This  can be called by the worker when a constant value is changed.
 * The main thread will receive a message with the changed value.
 * @param {number} id - the id of the constant
 * @param {number} type - the type of the constant (0 = number, 1 = matrix)
 */
  render_constant(id, type) {
    postMessage({
        message: "render_constant",
        id: id,
        type: type,
        value: get_constant(id, type),
    });
}

// ----------------------------------------> User API <--

/**
 * Sets a Lerp target value for a certain step of an animation.
 * @param {number} index - the index of the animation
 * @param {number} step - the step for which the value should be set
 * @param {number} value - the value to set
 */
 setLerp(index, step, value) {
    //console.log(lerpChain_registry.buffer[this.lerp_registry.lerp_chain_start[index]+step])
    this.sequence_registry.buffer[this.lerp_registry.lerp_chain_start[index] + step] =
        value;
}
/**
 * Sets the matrix lerp target value for a certain step of an animation.
 * @param {number} index - the index of the animation
 * @param {number} step - the step for which the value should be set
 * @param {number[]} value - the matrix to set. The matrix is a 1 dimensional array of floats with a length that is a multiple of 4 (e.g. [r1, g1, b1, a1, r2, g2, b2, a2])
 */
 setMatrix(index, step, value) {
    try{
    value.map((x, i) => {
        this.sequence_registry.matrix_sequences.get(index).get(step)[i] = x;
    });
    }
    catch(err){
        console.error(` error in setMatrix:
            ${err}`
        )
    }
}
/**
 * Updates a constant value.
 * @param {number} id - the id of the constant to update
 * @param {string} type - the type of the constant (number or matrix)
 * @param {number | number[]} value - the new value of the constant
 */
 update_constant(id, type, value) {
    this.constant_registry.update(type, id, value);
}
/**
 * Gets a constant value.
 * @param {number} id - the id of the constant
 * @param {string} type - the type of the constant (number or matrix)
 * @returns {number | number[]} value - the value of the constant
 */
 get_constant(id, type) {
    return this.constant_registry.get(type, id);
}
/**
 * Gets the current progress of the animation.
 * @param {number} id - The identifier for the animation.
 * @returns {number} - The current progress value of the animation.
 */
 get_time(id) {
    return this.lerp_registry.progress[id];
}
/**
 * Checks if an animation is currently running.
 * @param {number} id - The identifier for the animation.
 * @returns {boolean} - true if the animation is currently running, false otherwise.
 */

 is_active(id) {
    if(!this.lerp_registry.active_groups.has(this.lerp_registry.group.has(id)) || !this.lerp_registry.active_group_indices.get(this.lerp_registry.group.get(id)).has(id)){
    type=this.lerp_registry.type[id]
    switch(type){
        case(2 | 3):
        return this.lerp_registry.active_numbers.includes(id);
        case(3):
        return this.lerp_registry.active_matrices.has(id)
    }
} else {return this.lerp_registry.active_group_indices.get(this.lerp_registry.group.get(id)).has(id)}
    
}
/**
 * Gets the current step of the animation.
 * @param {number} id - The identifier for the animation.
 * @returns {number} - The current step value of the animation.
 */
 get_step(id) {
    return this.sequence_registry.progress(id);
}
/**
 * Gets the lerp result value of an animation.
 * @param {number} id - The identifier for the animation.
 * @returns {number} - The lerp result value of the animation.
 */

 get_lerp_value(id) {
    type=this.lerp_registry.type[id]
    group=this.lerp_registry.group.get(id)
    if(!group || !this.lerp_registry.active_groups.has(id))
    switch(type){
        case(2):  return this.lerp_registry.number_results.get(id);
        case(3): return this.lerp_registry.matrix_results.get(id)
    }
    else{
        return this.lerp_registry.active_group_indices.get(group).has(id)
    }
    
}
/**
 * Starts and resets an animation if its finished, or not playing.
 * @param {number} id - The identifier for the animation.
 */
 soft_reset(id) {
    this.sequence_registry.soft_reset(id);
}
/**
 * Starts and resets an animation.
 * @param {number} id - The identifier for the animation.
 */
 hard_reset(id) {
    this.sequence_registry.reset(id);
}
/**
 * Sets the current progress of an animation and updates the delta t value accordingly.
 * @param {number} id - The identifier for the animation.
 * @param {number} val - The new progress value for the animation.
 */
 set_time(id, val) {
    this.lerp_registry.progress = val;
}
/**
 * Sets the current step of an animation.
 * If the provided step value exceeds the maximum length of the animation, it will be set to the maximum length.
 * @param {number} id - The identifier for the animation.
 * @param {number} val - The desired step value for the animation.
 */

 set_step(id, val) {
    this.sequence_registry.progress[id] =
        val > this.sequence_registry.lengths[id] ? this.sequence_registry.lengths[id] : val;
}

 set_sequence_start(id, val) {
    this.lerp_registry.lerp_chain_start[id] = val;
}
 get_sequence_start(id) {
    return this.lerp_registry.lerp_chain_start[id];
}
 set_sequence_length(id, val) {
    this.sequence_registry.lengths[id] = val;
}

 get_sequence_length(id) {
    return this.sequence_registry.lengths[id];
}
/**
 * Retrieves the target value for a specific step of an animation.
 *
 * This  determines the type of the animation and returns the target value
 * for the specified step.
 *
 * @param {number} id - The identifier for the animation.
 * @param {number} step - The step for which to retrieve the target value.
 * @returns {number|number[]} - The target value for the specified step of the animation.
 */

 get_step_lerp_target_value(id, step) {
    if (this.lerp_registry.type[id] == 2)
        return this.sequence_registry.buffer[this.lerp_registry.lerp_chain_start[id] + step];
    else if (this.lerp_registry.type[id] == 3)
        return this.sequence_registry.matrix_sequences.get(id).get(step);
}

/**
 * Gets the duration of an animation.
 * @param {number} id - The identifier for the animation.
 * @returns {number} - The duration of the animation.
 */
 get_duration(id) {
    return this.lerp_registry.duration[id];
}
/**
 * Sets the duration of an animation.
 * @param {number} id - The identifier for the animation.
 * @param {number} val - The desired duration value for the animation.
 */
 set_duration(id, val) {
    this.lerp_registry.duration[id] = val;
}
/**
 * Retrieves the delay of an animation.
 * @param {number} id - The identifier for the animation.
 * @returns {number} - The delay value of the animation.
 */

 get_delay(id) {
    return this.lerp_registry.delay[id];
}
/**
 * Sets the delay of an animation.
 * @param {number} id - The identifier for the animation.
 * @param {number} val - The desired delay value for the animation.
 */
 set_delay(id, val) {
    this.lerp_registry.delay[id] = val;
}

/**
 * Retrieves the current delay progress value of an animation.
 * @param {number} id - The identifier for the animation.
 * @returns {number} - The current delay progress value of the animation.
 */
 get_delay_delta(id) {
    return this.lerp_registry.delay_delta[id];
}
/**
 * Sets the current delay progress value for an animation.
 * @param {number} id - The identifier for the animation.
 * @param {number} val - The desired delay progress value for the animation.
 */
 set_delay_delta(id, val) {
    this.lerp_registry.delay_delta[id] = val;
}

/**
 * Retrieves a specific row from a matrix constant.
 * @param {number} id - The identifier for the matrix constant.
 * @param {number} row - The index of the row to retrieve from the matrix constant.
 * @returns {Array} - The specified row from the matrix constant.
 */
 get_constant_row(id, row) {
    return this.constant_registry.get_row(id, row);
}

/**
 * Retrieves a constant number value by its identifier.
 * @param {number} id - The identifier for the constant number.
 * @returns {number} - The constant number value associated with the given identifier.
 */
 get_constant_number(id) {
    return this.constant_registry.get_number(id);
}
/**
 * Retrieves an array of all active animation identifiers.
 * @returns {Array<number>} - An array of active animation identifiers.
 */
 get_active_group_indices(group){
    return this.lerp_registry.active_groups.get(group)
}
 get_active(type) {
    switch(type){
        case(2):
            return this.lerp_registry.active_numbers
        case(3):return this.lerp_registry.active_matrices;
        case(4): return this.lerp_registry.active_timelines
}
}
/**
 * Retrieves a boolean indicating whether the animation loop is currently running.
 * @returns {boolean} - true if the animation loop is currently running, false otherwise.
 */
 get_status() {
    return this.loop_resolver != null;
}

/**
 * Replaces the target value for a specific step of an animation with a new one.
 *
 * If the animation type is not a matrix-chain, the  will set the lerp values
 * at the specified step and step + direction accordingly.
 *
 * If the animation type is a matrix-chain, the  will set the matrix values
 * at the specified step and step + direction accordingly.
 *
 * @param {object} opts - An object containing the following properties:
 * @param {number} opts.index - The index of the animation to reorient.
 * @param {number} opts.step - The step for which to reorient the target value.
 * @param {number} opts.direction - The direction (+1 or -1) in which to reorient the target value.
 * @param {number|number[]} opts.reference - The new target value to set for the animation.
 * @param {number[]} opts.matrix_row - The matrix row to set as the new target value.
 * @param {boolean} opts.verbose - Whether to log information about the reorientation process.
 */
 reorient_target({
    index,
    step=0,
    direction=1,
    reference,
    matrix_row = 0,
    start_reference,
    verbose = false,

}) {
    verbose && console.log("replacing indices " + index);
    if (this.lerp_registry.type[index] != 2) {
        if(start_reference){
            this.setMatrix(index, step, start_reference);
        }
        else{
            this.setMatrix(index, step, this.get_lerp_value(index));
        }
        this.setMatrix(index, step + direction, reference, matrix_row);
    } else {
        this.setLerp(index, step, reference);
        this.setLerp(index, step + direction, matrix_row);
    }
//    verbose && console.log("reoriented animation with index " + index);
}

/**
 * Reorients the duration of an animation.
 *
 * If min_duration is given, the  will soft_reset the animation and set its duration to the minimum of max_duration and max_duration - current_time + min_duration.
 *
 * @param {object} opts - An object containing the following properties:
 * @param {number} opts.index - The index of the animation to reorient.
 * @param {number} opts.min_duration - The minimum duration of the animation.
 * @param {number} opts.max_duration - The maximum duration of the animation.
 * @param {boolean} opts.verbose - Whether to log information about the reorientation process.
 */
 reorient_duration({
    index,
    min_duration,
    max_duration,
    verbose = false,
}) {
    if (min_duration != undefined) {
        this.soft_reset(index);
        const time = this.is_active(index) ? this.get_time(index) : 0;
        const duration =
            time < min_duration ? Math.floor(max_duration - time) : max_duration;
        this.set_duration(index, duration);
        verbose &&
            console.log("new start_duration for " + index + " is " + duration);
    }
}
/**
 * Linearly interpolates between two values.
 *
 * @param {number} value - The current value of the animation.
 * @param {number} target - The target value of the animation.
 * @param {number} min - The minimum value of the animation.
 * @param {number} max - The maximum value of the animation.
 * @param {number} threshold - The value to return if the interpolation would result in a value less than this.
 * @returns {number} The interpolated value.
 */
 lerp(value, target, min, max, threshold) {
    const t = (value - min) / (max - min);
    const result = target * t + (1 - t) * threshold;
    return result;
}
/**
 * Normalizes a distance between two values to a value between 0 and 1.
 * @param {number} target - The target value.
 * @param {number} current - The current value.
 * @param {number} max - The maximum value.
 * @returns {number} - The normalized distance.
 */
 normalizeDistance(target, current, max) {
    const distance = Math.abs(current - target);
    return distance / Math.abs(max - target);
}
/**
 * Clamps a value to a minimum and maximum value.
 *
 * @param {number} value - The value to clamp.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} The clamped value.
 */
 clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Reorients the duration of an animation based on the distance between the current value
 * and a target value.
 *
 * @param {object} opts - An object containing the following properties:
 * @param {number} opts.index - The index of the animation to reorient.
 * @param {number|number[]} opts.target - The target value towards which to reorient the animation.
 * @param {number} opts.max_distance - The max distance.
 * @param {number} opts.min_duration - The minimum duration of the animation.
 * @param {number} opts.max_duration - The maximum duration of the animation.
 * @param {string} opts.mode - The mode to use for calculating the distance. Possible values are "max_distance",
 *                             "manhattan_distance", "cosine_similarity", and "vector_magnitude".
 *
 * @returns {object} - {duration,differences}
 */
 reorient_duration_by_distance({
    index,
    target,
    max_distance,
    min_duration,
    max_duration,
    mode = "max_distance",
    reorientate_steps=false
}) {
    const current = this.get_lerp_value(index);

    if (this.lerp_registry.type[index] != 2) {
        var dif
        switch (mode) {
            case "max_distance":
                const distances = [];
                dif=[]
                for (let i = 0; i < target.length; i++) {
                    distances.push(Math.abs(target[i] - current[i]));
                    dif.push(target[i] - current[i])
                }
                distance = Math.max(...distances);
                
                break;
            case "manhattan_distance":
                distance = 0;
                dif=[]
                for (let i = 0; i < target.length; i++) {
                    distance += Math.abs(target[i] - current[i]);
                    dif.push(target[i] - current[i])
                }
                break;
            case "cosine_similarity":
                const dotProduct = 0;
                const magnitudeTarget = 0;
                const magnitudeCurrent = 0;
                dif=[]
                for (let i = 0; i < target.length; i++) {
                    dotProduct += target[i] * current[i];
                    dif.push(target[i] - current[i])
                    magnitudeTarget += target[i] ** 2;
                    magnitudeCurrent += current[i] ** 2;
                }
                magnitudeTarget = Math.sqrt(magnitudeTarget);
                magnitudeCurrent = Math.sqrt(magnitudeCurrent);
                distance = 1 - dotProduct / (magnitudeTarget * magnitudeCurrent);
                break;
            case "vector_magnitude":
                distance = 0;
                dif=[]
                for (let i = 0; i < target.length; i++) {
                    distance += (target[i] - current[i]) ** 2;
                    dif.push((target[i] - current[i]))
                }
                distance = Math.sqrt(distance);
                break;
            default:
                throw new Error(`Unbekannter Modus: ${mode}`);
        }
    } else if (this.lerp_registry.type[index] == 2)
        distance = Math.abs(target - max_distance);
    duration =
        min_duration + (distance / max_distance) * (max_duration - min_duration);
    //Math.min(max_duration, Math.max(min_duration, distance * max_distance));
    this.soft_reset(index);
    this.set_duration(index, duration);
    return {
        duration:duration,
        diffrences:dif
    };
}
 reorient_duration_by_progress({ index, min_duration, max_duration,soft_reset=true }) {
    const progress = this.get_time(index) / max_duration;

    duration = min_duration + progress * (max_duration - min_duration);
    //Math.min(max_duration, Math.max(min_duration, distance * max_distance));
    if(soft_reset){
        this.soft_reset(index);
    }
    else{
        
    }
    this.set_duration(index, duration);
    return duration;
}
/**
 * Reverses the order of the lerp or matrix values in the animation sequence.
 *
 * @param {number|string} id - The identifier for the animation or the lerp-chain to reverse.
 *
 * @category Animation
 */
 reverse(id) {
    if (type(id) != "number") {
        for (
            let i = this.lerp_registry.lerp_chain_start[id];
            i <= this.lerp_registry.lerp_chain_start[id] + this.sequence_registry.lengths[id];
            i++
        ) {
            this.sequence_registry.buffer[this.sequence_registry.lengths[id] - i] =
                this.sequence_registry.buffer[i];
        }
    } else {
        const newMap = new Map();
        this.sequence_registry.matrix_sequences.get(id).forEach((val, i) => {
            newMap.set(this.sequence_registry.lengths[id] - i, val);
        });
        this.sequence_registry.matrix_sequences.set(id, newMap);
    }
}
reverse_group_delays(id){
    this.matrix_chain_registry.indices.get(id).map((val,i)=>{
        // if(i==this.matrix_chain_registry.indices.get(id).length-1){
        //     return
        // }
        const target_index=this.matrix_chain_registry.indices.get(id).length-i
        const target=this.matrix_chain_registry.indices.get(id)[target_index-1]
        const target_delay=this.get_delay(target)
        this.set_delay(target,this.get_delay(val))
        this.set_delay(val,target_delay)
    })
}
set_group_orientation(id,orientation){  
    this.matrix_chain_registry.orientation_step.set(id,orientation)
}
    /**
 * Starts an animation sequence for a matrix chain.
 *
 * @param {number[]} directions - The directions for the animation sequence.
 * @param {number[]} indices - The indices for the animation sequence.
 * @param {number[] | false} reorient - [start,target] | false if you ont want to set the current lerp value as the new start value
 * otherwise the matrix animation wont be set
 * @category Animation
 */
start_group(directions, indices,reorient) {
    indices.map((indices2,i)=>{
        if(!this.lerp_registry.active_groups.has(i)){
        this.matrix_chain_registry.start_matrix_chain(directions[i],indices2,reorient)
        }
        // this.start_animations(this.matrix_chain_registry.indices.get(indices2))
    })
    this.start_loop();
}
/**
 * Resets all animations of a group.
 * You can optionally reorientate the group during the reset if you pass a reference.
 *
 * @param {number} id - The identifier of the group to reset.
 * @param {Array} start - the target reference to use for the start value
 * @param {number} target - The target reference index to use during the reset.
 */

reset_group(id,start,target){
    this.matrix_chain_registry.reset_group(id,start,target)
    
}
stop_group(indices) {
    if(indices=="all"){
        
        indices=[...this.lerp_registry.active_groups]
    }
    indices.map((id,i)=>{
    if(this.lerp_registry.active_groups.has(id)){
        this.lerp_registry.active_groups.delete(id)
        this.lerp_registry.active_group_indices.get(id).clear() 
        this.matrix_chain_registry.progress[id]=0
        this.stop_animations(this.matrix_chain_registry.indices.get(id))
    }

    })
}
get_group_values(id){
    return{
        active:this.lerp_registry.active_groups.has(id),
        progress:this.matrix_chain_registry.progress[id],
        orientation:this.matrix_chain_registry.orientation_step.get(id),
        active_indices:this.lerp_registry.active_group_indices.get(id),
        loop:this.matrix_chain_registry.group_loop[id]
    }
}
set_group_values(id,field,value,step){
    switch(field){
        case "max_duration":
            this.matrix_chain_registry.max_duration[id]=value
            break;
        case "min_duration":
            this.matrix_chain_registry.min_duration[id]=value
            break;
        case "progress":
            this.matrix_chain_registry.progress[id]=value
            break;
        case "sequence_length":
            this.matrix_chain_registry.sequence_length[id]=value
            break;
        case "group_loop":
            this.matrix_chain_registry.group_loop[id]=value
        case "orientation_step":
            this.matrix_chain_registry.orientation_step.set(id,value)
            break;
        case "ref_matrix":
            if(this.matrix_chain_registry.uni_size[id]==1){
                this.matrix_chain_registry.ref_matrix.get(id).get(step).map((x,i)=>{
                    this.matrix_chain_registry.ref_matrix.get(id).get(step)[i]=value[i]
                })
                }
            else{
                const size=this.matrix_chain_registry.max_length[id]
                this.matrix_chain_registry.ref_matrix.get(id).set(id*size+step).map((x,i)=>x=   value[i])
            }
            
            break;
    }
}
}
export{
Worker_Utils
}

