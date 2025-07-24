import { useContext, useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line, Rect, Circle, Transformer } from 'react-konva';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Context } from './Context';
import DrawTool from './DrawTool';

import styles from './workspace.module.less';
import GuildTool from './GuildTool';
import EditLine from './editLine';
import { DrawType } from '../components/tool/config';
import EditRect from './editRect';
import EditCircle from './editCircle';
import ArcShape from './ArcShape';

interface ShapeProps {
  data: any;
};

const Shape = (props: ShapeProps) => {
  const { data } = props;

  if ([DrawType.ployLine, DrawType.line].includes(data.type)) {
    return <Line listening={false} strokeScaleEnabled={false} strokeWidth={1} stroke="#000" points={data.pointUnits} />;
  }

  if (data.type === DrawType.rect) {
    return <Rect listening={false} strokeScaleEnabled={false} strokeWidth={1} stroke="#000" x={data.x} y={data.y} height={data.height} width={data.width} />;
  }

  if (data.type === DrawType.circle) {
    return <Circle listening={false} strokeScaleEnabled={false} strokeWidth={1} stroke="#000" x={data.x} y={data.y} radius={data.radius} />;
  }

  if (data.type === DrawType.arc) {
    return <ArcShape strokeWidth={1} stroke="#000" x={1} y={1} angle={10} radius={1} />;
  }
};

const EditShape = (props: ShapeProps) => {
  const { data } = props;

  if ([DrawType.ployLine, DrawType.line].includes(data.type)) {
    return <EditLine line={data} />;
  }

  if (data.type === DrawType.rect) {
    return <EditRect rect={data} />
  }

  if (data.type === DrawType.circle) {
    return <EditCircle circle={data} />;
  }
};

const Workspace = () => {
  const { drawMode, setState, drawTool, shapes, guildTool, selectShapIds } = useContext(Context);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [key, setKey] = useState(1);
  const [scale, setScale] = useState({ x: 1, y: 1 });
  const renderLayer = useRef<Konva.Layer>(null);

  const handlerDraw = (ev: KonvaEventObject<MouseEvent>) => {
    drawTool && drawTool.draw(ev);

    if (!drawMode && renderLayer.current && ev.target instanceof Konva.Stage) {
      const x = ev.target.pointerPos.x;
      const y = ev.target.pointerPos.y;
      const box =  {
          width: 6,
          height: 6,
          x: x - 3,
          y: y- 3
      };
      const shapes = renderLayer.current.getChildren();
      const shape = shapes.find(shape => Konva.Util.haveIntersection(box, shape.getClientRect()));
      if (shape) {
        const id = shape.id();
        selectShapIds[0] = id;
        setState({ selectShapIds });
      }
    }
  };

  const handlerMouseMove = (ev: KonvaEventObject<MouseEvent>) => {
    drawTool && drawTool.drawMove(ev);
    setKey(key + 1);
  };

  const handlerKeyDown =(evt: KeyboardEvent) => {
    if (['Escape', 'Enter'].includes(evt.key)) {
      if (drawTool && [DrawType.ployLine, DrawType.line].includes(drawTool.drawMode)) {
        drawTool && drawTool.drawEnd();
      } else {
        if (evt.key === 'Escape') {
          setState({ selectShapIds: [] });
        }
      }
    } else if (['Delete', 'Backspace'].includes(evt.key)) {
      // 删除
      if (selectShapIds.length) {
        const otherShaps = shapes.filter(shape => !selectShapIds.includes(shape.id));
        selectShapIds.length = 0;
        shapes.length = 0;
        shapes.push(...otherShaps);
        setState({
          selectShapIds,
          shapes
        });
      }
    }
  };

  /**
   * 放大缩小
   * @param opt 
   */
  const handlerWheel = (opt: { evt: { deltaY: any; }; }) => {
    if (!drawMode) {
      const delta = opt.evt.deltaY;
      let zoom = scale.x;
      zoom *= 0.999 ** delta;
      setState({ zoom })
      setScale({
          x: zoom,
          y: zoom
      });
    }
  };

  useEffect(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight - 64);
    const guildTool = new GuildTool();
    const drawTool = new DrawTool(guildTool, (addShapes: any[]) => {
      shapes.push(...addShapes);
      setState({
        shapes,
        drawMode: ''
      });
    });

    setState({
      drawTool,
      guildTool
    });
  }, []);


  useEffect(() => {
    window.addEventListener('keydown', handlerKeyDown);
    return () => {
      window.removeEventListener('keydown', handlerKeyDown);
    };
  }, [drawTool]);

  return (
    <Stage
      className={ drawMode ? styles.drawing : '' }
      scale={scale}
      width={width}
      height={height}
      onMouseDown={handlerDraw}
      onMouseMove={handlerMouseMove}
      onWheel={handlerWheel}
      >
      {/* drawLayer */}
      <Layer>
        {
          drawTool && drawTool.drawShaps.map(shape => <Shape key={key} data={shape} />)
        }
      </Layer>
      {/* 引导线layer */}
      <Layer>
        {
          guildTool && guildTool.guildLines.map((line, index) => (
            <Line dash={[4, 4]} key={`guild-${key}-${index}`} lineCap="round" strokeScaleEnabled={false} strokeWidth={1} stroke="rgba(4, 150, 6)" points={line} />
          ))
        }
      </Layer>
      {/* 渲染layer */}
      <Layer ref={renderLayer}>
        {
          shapes.map((shape) => <EditShape key={shape.id} data={shape} />)
        }
        <Transformer />
      </Layer>
    </Stage>
  );
};

export default Workspace;