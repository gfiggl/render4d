namespace render {
    /**vertex shader
     *                                                             
     * takes some data and norms, applies them to some uniforms and outputs the new data
     * 
     * (data,norm,uniforms)->new_data (could include new norms)
     */
    export interface VertShader {
        (data: uint32[], norm: uint32[], uniforms: uint32[][]): uint32[]
    }

    /**fragment shader
     * 
     * takes in data and outputs a color
     * 
     * data->color
     */
    export interface FragShader {
        (data: uint32): uint8
    }

    /**dot product - x1 \* x2 + y1 \* y2 + z1 \* z2*/
    export function dot(vec1: uint32[], vec2: uint32[]) {
        return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
    }

    /**cross product - x1 \* y2 - y1 \* x2*/
    export function cross(vec1: uint32[], vec2: uint32[]) {
        return vec1[0] * vec2[1] - vec1[1] * vec2[0];
    }
}