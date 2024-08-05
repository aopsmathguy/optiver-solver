import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
    selectProperties
} from "../../store/slices/figure-it-out";

import { StyledOutlinedCanvas } from "./style";

function Figure({ figureParams }) {
    const properties = useSelector(selectProperties);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!properties.length) return;

        const figureObj = {};
        for (let i = 0; i < properties.length; i++) {
            const key = properties[i].property;
            const value = figureParams[i];
            figureObj[key] = value;
        }
        const { color, shape, size, fill } = figureObj;

        const dpr = window.devicePixelRatio || 1;

        const patternCanvas = document.createElement("canvas");
        const patternContext = patternCanvas.getContext("2d");
        patternCanvas.width = 10 * dpr;
        patternCanvas.height = 10 * dpr;
        patternContext.fillStyle = color;
        patternContext.strokeStyle = color;
        patternContext.lineWidth = 4;
        patternContext.scale(dpr, dpr);

        switch (fill) {
            case 'solid':
                patternContext.fillRect(0, 0, 10, 10);
                break;
            case 'striped':
                patternContext.beginPath();
                patternContext.moveTo(0, 5);
                patternContext.lineTo(10, 5);
                patternContext.stroke();
                break;
            case 'dotted':
                patternContext.beginPath();
                patternContext.arc(5, 5, 2, 0, 2 * Math.PI);
                patternContext.fill();
                break;
            default:
                break;
        }

        const shapeCanvas = canvasRef.current;
        const shapeContext = shapeCanvas.getContext("2d");
        shapeCanvas.width = 100 * dpr;
        shapeCanvas.height = 100 * dpr;

        const pattern = shapeContext.createPattern(patternCanvas, "repeat");
        shapeContext.fillStyle = pattern;
        shapeContext.strokeStyle = color;
        shapeContext.lineWidth = 4 * dpr;
        shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
        shapeContext.translate(50* dpr, 50* dpr);

        let scaling = dpr;
        switch(size){
            case 'small':
                scaling *= 0.5;
                break;
            case 'medium':
                scaling *= 0.75;
                break;
            case 'large':
                scaling *= 1.1;
                break;
            default:
                break;
        }

        switch(shape){
            case 'circle':
                shapeContext.beginPath();
                shapeContext.arc(0, 0, 40* scaling, 0, 2 * Math.PI);
                break;
            case 'square':
                shapeContext.beginPath();
                shapeContext.rect(-35*scaling, -35*scaling, 70*scaling, 70*scaling);
                shapeContext.closePath();
                break;
            case 'triangle':
                shapeContext.beginPath();
                shapeContext.moveTo(0, -35*scaling);
                shapeContext.lineTo(40*scaling, 35*scaling);
                shapeContext.lineTo(-40*scaling, 35*scaling);
                shapeContext.closePath();
                break;
            case 'star':
                shapeContext.beginPath();
                for (let i = 0; i < 10; i++){
                    const angle = i * Math.PI / 5;
                    const radius = i % 2 === 0 ? 40 : 20;
                    shapeContext.lineTo(scaling* radius * Math.sin(angle), -scaling * radius * Math.cos(angle));
                }
                shapeContext.closePath();
                break;
        }
        shapeContext.fill();
        shapeContext.stroke();
    }, [figureParams, properties]);

    return <StyledOutlinedCanvas ref={canvasRef}/>;
}

export default Figure;