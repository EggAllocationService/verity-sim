export enum SHAPE2D {
    SQUARE = "square",
    CIRCLE = "circle",
    TRIANGLE = "triangle"
}
export enum SHAPE {
    SPHERE = "sphere", // circle + circle
    CYLINDER = "cylinder", // circle + square
    CUBE = "cube", // square + square
    CONE = "cone", // triangle + circle
    PYRAMID = "pyramid", // triangle + triangle
    PRISM = "prism" // square + triangle
}

export function construct_shape_from_2d(a: SHAPE2D, b: SHAPE2D): SHAPE {
    if (a === SHAPE2D.SQUARE && b === SHAPE2D.SQUARE) {
        return SHAPE.CUBE;
    } else if (a === SHAPE2D.CIRCLE && b === SHAPE2D.CIRCLE) {
        return SHAPE.SPHERE;
    } else if (a === SHAPE2D.CIRCLE && b === SHAPE2D.SQUARE) {
        return SHAPE.CYLINDER;
    } else if (a === SHAPE2D.TRIANGLE && b === SHAPE2D.CIRCLE) {
        return SHAPE.CONE;
    } else if (a === SHAPE2D.TRIANGLE && b === SHAPE2D.TRIANGLE) {
        return SHAPE.PYRAMID;
    } else if (a === SHAPE2D.SQUARE && b === SHAPE2D.TRIANGLE) {
        return SHAPE.PRISM;
    } else {
        if (a == undefined || b == undefined) {
            debugger;
        }
        return construct_shape_from_2d(b, a);
    }
}

export function decompose_shape(a: SHAPE): [SHAPE2D, SHAPE2D]  {
    switch (a) {
        case SHAPE.SPHERE:
            return [SHAPE2D.CIRCLE, SHAPE2D.CIRCLE];
        case SHAPE.CYLINDER:
            return [SHAPE2D.CIRCLE, SHAPE2D.SQUARE];
        case SHAPE.CUBE:
            return [SHAPE2D.SQUARE, SHAPE2D.SQUARE];
        case SHAPE.CONE:
            return [SHAPE2D.TRIANGLE, SHAPE2D.CIRCLE];
        case SHAPE.PYRAMID:
            return [SHAPE2D.TRIANGLE, SHAPE2D.TRIANGLE];
        case SHAPE.PRISM:
            return [SHAPE2D.SQUARE, SHAPE2D.TRIANGLE];
    }
}