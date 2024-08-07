import { useEffect, useRef } from "react";
import { StyledOutlinedCanvas } from "./style";
function PropertyIcon({ property, value }) {//for example, 'color', 'red' or 'pattern', 'striped'
    const canvasRef = useRef(null); 
    useEffect(()=>{
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 100 * dpr;
        canvas.height = 100 * dpr;
        switch (property){
            case 'color':
                context.fillStyle = value;
                context.fillRect(0, 0, canvas.width, canvas.height);
                break;
            case 'fill':
                const patternCanvas = document.createElement('canvas');
                const patternContext = patternCanvas.getContext('2d');
                patternCanvas.width = 10 * dpr;
                patternCanvas.height = 10 * dpr;
                patternContext.fillStyle = 'black';
                patternContext.strokeStyle = 'black';
                patternContext.lineWidth = 2;
                patternContext.scale(dpr, dpr);
                switch (value){
                    case 'solid':
                        patternContext.beginPath();
                        patternContext.rect(0, 0, 10, 10);
                        patternContext.closePath();
                        patternContext.fill();
                        break;
                    case 'horizontal-striped':
                        patternContext.beginPath();
                        patternContext.moveTo(0, 5);
                        patternContext.lineTo(10, 5);
                        patternContext.closePath();
                        patternContext.stroke();
                        break;
                    case 'vertical-striped':
                        patternContext.beginPath();
                        patternContext.moveTo(5, 0);
                        patternContext.lineTo(5, 10);
                        patternContext.closePath();
                        patternContext.stroke();
                        break;
                    case 'cross-hatch':
                        patternContext.beginPath();
                        patternContext.moveTo(0, 0);
                        patternContext.lineTo(10, 10);
                        patternContext.moveTo(10, 0);
                        patternContext.lineTo(0, 10);
                        patternContext.closePath();
                        patternContext.stroke();
                        break;
                    case 'dotted':
                        patternContext.beginPath();
                        patternContext.arc(5, 5, 2, 0, 2 * Math.PI);
                        patternContext.closePath();
                        patternContext.fill();
                        break;
                    default:
                        break;
                }
                const pattern = context.createPattern(patternCanvas, 'repeat');
                context.fillStyle = pattern;
                context.fillRect(0, 0, canvas.width, canvas.height);
                break;
            case 'shape':
                context.translate(50 * dpr, 50 * dpr);
                context.beginPath();
                switch(value){
                    case 'circle':
                        context.arc(0, 0, 35 * dpr, 0, 2 * Math.PI);
                        break;
                    case 'square':
                        context.rect(-35 * dpr, -35 * dpr, 70 * dpr, 70 * dpr);
                        break;
                    case 'triangle':
                        context.moveTo(0, -35 * dpr);
                        context.lineTo(40 * dpr, 35 * dpr);
                        context.lineTo(-40 * dpr, 35 * dpr);
                        break;
                    case 'star':
                        for (let i = 0; i < 10; i++){
                            const angle = i * Math.PI / 5;
                            const radius = i % 2 === 0 ? 40 : 20;
                            context.lineTo(dpr* radius * Math.sin(angle), -dpr * radius * Math.cos(angle));
                        }
                        break;
                }
                context.closePath();
                context.strokeStyle = 'black';
                context.lineWidth = 4 * dpr;
                context.stroke();
                break;
            case 'dot':
                context.fillStyle = 'black';
                context.translate(50 * dpr, 50 * dpr);
                context.beginPath();
                switch(value){
                    case 'left':
                        context.arc(-45 * dpr, 0, 5 * dpr, 0, 2 * Math.PI);
                        break;
                    case 'up':
                        context.arc(0, -45 * dpr, 5 * dpr, 0, 2 * Math.PI);
                        break;
                    case 'right':
                        context.arc(45 * dpr, 0, 5 * dpr, 0, 2 * Math.PI);
                        break;
                    case 'down':
                        context.arc(0, 45 * dpr, 5 * dpr, 0, 2 * Math.PI);
                        break;
                    default:
                        break;
                }
                context.fill();
                break;
            case 'dotColor':
                context.fillStyle = value;
                context.translate(50 * dpr, 50 * dpr);
                context.beginPath();
                context.arc(0, 0, 5 * dpr, 0, 2 * Math.PI);
                context.fill();
                break;
        }
    }, [property, value])
    return <StyledOutlinedCanvas ref={canvasRef}/>;
}
export default PropertyIcon;