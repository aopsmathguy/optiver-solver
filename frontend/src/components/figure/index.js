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
        const { color, shape, fill, dot } = figureObj;

        const dpr = window.devicePixelRatio || 1;

        const patternCanvas = document.createElement("canvas");
        const patternContext = patternCanvas.getContext("2d");
        patternCanvas.width = 10 * dpr;
        patternCanvas.height = 10 * dpr;
        patternContext.fillStyle = color;
        patternContext.strokeStyle = color;
        patternContext.lineWidth = 2;
        patternContext.scale(dpr, dpr);

        switch (fill) {
            case 'solid':
                patternContext.fillRect(0, 0, 10, 10);
                break;
            case 'horizontal-striped':
                patternContext.beginPath();
                patternContext.moveTo(0, 5);
                patternContext.lineTo(10, 5);
                patternContext.stroke();
                break;
            case 'vertical-striped':
                patternContext.beginPath();
                patternContext.moveTo(5, 0);
                patternContext.lineTo(5, 10);
                patternContext.stroke();
                break;
            case 'cross-hatch':
                patternContext.beginPath();
                patternContext.moveTo(0, 0);
                patternContext.lineTo(10, 10);
                patternContext.moveTo(10, 0);
                patternContext.lineTo(0, 10);
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

        shapeContext.beginPath();
        switch(shape){
            case 'circle':
                shapeContext.arc(0, 0, 35* dpr, 0, 2 * Math.PI);
                break;
            case 'square':
                shapeContext.rect(-35*dpr, -35*dpr, 70*dpr, 70*dpr);
                break;
            case 'triangle':
                shapeContext.moveTo(0, -35*dpr);
                shapeContext.lineTo(40*dpr, 35*dpr);
                shapeContext.lineTo(-40*dpr, 35*dpr);
                break;
            case 'star':
                for (let i = 0; i < 10; i++){
                    const angle = i * Math.PI / 5;
                    const radius = i % 2 === 0 ? 40 : 20;
                    shapeContext.lineTo(dpr* radius * Math.sin(angle), -dpr * radius * Math.cos(angle));
                }
                break;
        }
        shapeContext.closePath();
        shapeContext.fill();
        shapeContext.stroke();
        shapeContext.fillStyle = color;
        shapeContext.beginPath();
        switch(dot){
            case 'left':
                shapeContext.arc(-45*dpr, 0, 5*dpr, 0, 2 * Math.PI);
                break;
            case 'up':
                shapeContext.arc(0, -45*dpr, 5*dpr, 0, 2 * Math.PI);
                break;
            case 'right':
                shapeContext.arc(45*dpr, 0, 5*dpr, 0, 2 * Math.PI);
                break;
            case 'down':
                shapeContext.arc(0, 45*dpr, 5*dpr, 0, 2 * Math.PI);
        }
        shapeContext.fill();
        
    }, [figureParams, properties]);

    return <StyledOutlinedCanvas ref={canvasRef}/>;
}

export default Figure;