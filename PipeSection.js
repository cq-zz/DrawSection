// 管道截面绘制
class PipeSection {
    /**
     * @param {*} domID     父级元素id
     * @param {*} width     画布宽
     * @param {*} height    画布高
     * @param {*} padding   内边距
     * @param {*} scale     刻度递增值
     * @param {*} ratio     刻度间距
     * @param {*} minX      最小x坐标
     * @param {*} minY      最小y坐标
     * @param {*} data      数据
     */
    constructor(domID, width, height, padding, scale, ratio, minX, minY, data = []) {
        this.domID = domID;
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.ratio = ratio;
        this.padding = padding;
        this.minX = minX;
        this.minY = minY;
        this.data = data;
        this.canvasId = "SectionCanvas";
        const _Init = this.initCanvas();
        this.ctx = _Init.ctx;
        this.canvas = _Init.canvas;
        this.initCoord();
        this.drawGraph(this.data);
    };
    // 初始化画布
    initCanvas() {
        let _box = document.getElementById(this.domID);
        let _oldCanvas = document.getElementById(this.canvasId);
        if (_oldCanvas) {
            _box.removeChild(_oldCanvas);
        }
        let _canvas = document.createElement("canvas");
        _canvas.id = this.canvasId;
        _canvas.style.cursor = "pointer";
        _box.appendChild(_canvas);

        //设置宽高必定要在canvas节点添加以后
        let _curCanvas = document.getElementById(this.canvasId);
        _curCanvas.width = this.width;
        _curCanvas.height = this.height;
        const ctx = _curCanvas.getContext("2d");
        return {
            ctx,
            canvas: _curCanvas
        };
    };
    // 初始化坐标轴
    initCoord() {
        const _XLength = this.width - 2 * this.padding;   // x轴线长度
        const _YLength = this.height - 2 * this.padding; // y轴线长度

        const _OriginPoint = this.getNewOrigin();
        let _OriginX = _OriginPoint[0]; // 原点横坐标
        let _OriginY = _OriginPoint[1]; // 原点纵坐标
        // 重置原点
        this.ctx.translate(_OriginX, _OriginY);

        const _YScaleNum = Math.floor(_YLength / this.ratio);
        const _XScaleNum = Math.floor(_XLength / this.ratio);

        let xScaleArr = []; // x轴刻度
        let yScaleArr = []; // y轴刻度
        for (let i = 0; i < _XScaleNum + 1; i++) {
            xScaleArr.push(this.minX + i * this.scale);
        }
        for (let j = 0; j < _YScaleNum + 1; j++) {
            yScaleArr.push(this.minY + j * this.scale);
        }

        // 绘制基本坐标轴线
        this.ctx.beginPath();
        this.ctx.moveTo(xScaleArr[0] / this.scale * this.ratio, -(_OriginY - this.padding));
        this.ctx.lineTo(xScaleArr[0] / this.scale * this.ratio, (_YLength - _OriginY + this.padding));
        this.ctx.lineTo(xScaleArr[0] / this.scale * this.ratio + _XLength, (_YLength - _OriginY + this.padding));
        this.ctx.stroke();

        // 绘制坐标刻度
        function drawScale(curCtx, point, text, size = 14, dir, color = "#000") {
            curCtx.beginPath();
            const TextWidth = curCtx.measureText(text).width;
            let newPoint = [...point];
            if (dir) {
                newPoint = [point[0] - TextWidth / 2, point[1] + size];
            } else {
                newPoint = [point[0] - TextWidth, point[1] + size / 2];
            }
            curCtx.font = `${size}px Arial`;
            curCtx.fillStyle = color;
            curCtx.fillText(text, newPoint[0], newPoint[1]);
        };

        // 最小/大y坐标取反
        let minYPoint = this.minY > 0 ? this.minY / this.scale * this.ratio : -this.minY / this.scale * this.ratio;
        // 最大y坐标取反
        let maxYPoint = yScaleArr[yScaleArr.length - 1] > 0 ?
            -yScaleArr[yScaleArr.length - 1] / this.scale * this.ratio :
            yScaleArr[yScaleArr.length - 1] / this.scale * this.ratio;
        // 绘制轴线与刻度
        for (let x = 0; x < _XScaleNum + 1; x++) {
            let xValue = xScaleArr[x] / this.scale * this.ratio;
            // 刻度线
            this.ctx.beginPath();
            this.ctx.moveTo(xValue, minYPoint + 10);
            this.ctx.lineTo(xValue, minYPoint);
            this.ctx.strokeStyle = "#000";
            this.ctx.stroke();
            // x轴网格线
            if (x > 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(xValue, minYPoint);
                this.ctx.lineTo(xValue, maxYPoint);
                this.ctx.strokeStyle = "#d1d1d1";
                this.ctx.stroke();
            }
            drawScale(this.ctx, [xValue, _YLength - _OriginY + this.padding + 10], xScaleArr[x], 20, true);
        }
        for (let y = 0; y < _YScaleNum + 1; y++) {
            let yValue = 0;
            if (yScaleArr[y] < 0) {
                yValue = Math.abs(yScaleArr[y]) / this.scale * this.ratio;
            } else {
                yValue = -Math.abs(yScaleArr[y]) / this.scale * this.ratio;
            }
            // 刻度线
            this.ctx.beginPath();
            this.ctx.moveTo(this.minX / this.scale * this.ratio - 10, yValue);
            this.ctx.lineTo(xScaleArr[0] / this.scale * this.ratio, yValue);
            this.ctx.strokeStyle = "#000";
            this.ctx.stroke();
            // y轴网格线
            if (y > 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.minX / this.scale * this.ratio, yValue);
                this.ctx.lineTo(xScaleArr[0] / this.scale * this.ratio + _XLength, yValue);
                this.ctx.strokeStyle = "#d1d1d1";
                this.ctx.stroke();
            }
            drawScale(this.ctx, [this.minX / this.scale * this.ratio - 10, yValue], yScaleArr[y], 20, false);
        }
    };
    // 画布点击事件
    canvasClick(callback) {
        const _OriginPoint = this.getNewOrigin(); // 获取原点
        const _Ratio = this.ratio;
        const _Scale = this.scale;
        const _Data = this.data;

        // 画布点击事件
        const _that = this;
        this.canvas.onclick = function (e) {
            // 当前点击位置的x,y坐标
            const _CurPointX = Number(((e.offsetX - _OriginPoint[0]) / _Ratio * _Scale).toFixed(2));
            const _CurPointY = -Number(((e.offsetY - _OriginPoint[1]) / _Ratio * _Scale).toFixed(2));
            const _CurData = _that.getPointGraphData(_Data, [_CurPointX, _CurPointY]);
            if (!!_CurData) {
                callback({
                    item: _CurData,
                    point: [e.x, e.y]
                });
            }
        };
    };
    // 设置新原点
    getNewOrigin() {
        const _YLength = this.height - 2 * this.padding; // y轴线长度

        let _OriginX = this.padding; // 原点横坐标
        let _OriginY = this.padding + _YLength; // 原点纵坐标

        const _Y = Number((Math.abs(this.minY) / this.scale * this.ratio).toFixed(2));
        const _X = Number((Math.abs(this.minX) / this.scale * this.ratio).toFixed(2));
        if (this.minX < 0) {
            _OriginX = this.padding + _X;
        }
        if (this.minY < 0) {
            _OriginY = _YLength - _Y + this.padding;
        }

        return [_OriginX, _OriginY];
    };
    /**
     * 获取点击位置的图形与数据
     * @param {*} data
     * @param {*} point
     */
    getPointGraphData(data, point) {
        for (let i = 0; i < data.length; i++) {
            let inside = false; // 是否在某个图形上
            switch (data[i].type) {
                case 'arc':
                    inside = this.isInTheArc(data[i], point);
                    if (inside) {
                        return data[i]
                    }
                    break;
                case 'rect':
                    inside = this.isInTheRect(data[i], point);
                    if (inside) {
                        return data[i]
                    }
                    break;
                case 'line':
                    inside = this.isInTheLine(data[i], point);
                    if (inside) {
                        return data[i]
                    }
                    break;
                default:
                    break;
            }
        }
        return false;
    };
    /**
     * 是否在圆内
     * @param {*} item 当前圆的数据
     * @param {*} point 
     */
    isInTheArc(item, point) {
        const _CenterX = item.point[0];
        const _CenterY = item.point[1];
        const _R = item.r;
        const _DiffX = _CenterX - point[0];
        const _DiffY = _CenterY - point[1];
        if (_R * _R >= ((_DiffX * _DiffX) + (_DiffY * _DiffY))) {
            return true;
        }
        return false;
    };
    /**
     * 是否在矩形内
     * @param {*} item 当前矩形的数据
     * @param {*} point 
     */
    isInTheRect(item, point) {
        const _MinX = item.point[0];
        const _MaxX = item.point[0] + item.width;
        const _MinY = item.point[1] - item.height;
        const _MaxY = item.point[1];
        if (point[0] >= _MinX && point[0] <= _MaxX && point[1] >= _MinY && point[1] <= _MaxY) {
            return true;
        }
        return false;
    };
    /**
     * 是否在线上
     * @param {*} item 当前线的数据
     * @param {*} point 
     */
    isInTheLine(item, point) {
        const _Path = item.path;
        for (let p = 0; p < _Path.length - 1; p++) {
            // 斜率
            const _K1 = (point[1] - _Path[p][1]) / (point[0] - _Path[p][0]);
            const _K2 = (_Path[p + 1][1] - point[1]) / (_Path[p + 1][0] - point[0]);
            // 两条线段斜率相等则点在线上（这里误差设置为.1）
            if (Math.abs((_K2 - _K1).toFixed(2)) <= .1) {
                return true;
            }
        }
        return false;
    };
    /**
     * 绘制图形
     * @param {*} data []
     * [{type: 'arc', point: [number, number], r: number}...] 圆形
     * [{type: 'rect', point: [number, number], width: number, height: number}...] 矩形
     * [{type: 'line', path: [[number, number],[number, number]...]}...] 线
     */
    drawGraph(data) {
        for (let i = 0; i < data.length; i++) {
            switch (data[i].type) {
                case 'arc':
                    this.drawArc(this.ctx, data[i].point, data[i].r);
                    break;
                case 'rect':
                    this.drawRect(this.ctx, data[i].point, data[i].width, data[i].height);
                    break;
                case 'line':
                    this.drawLine(this.ctx, data[i].path);
                    break;
                default:
                    break;
            }
        }
    };
    /**
     * 绘制文本
     * @param {*} ctx 
     * @param {*} point 
     * @param {*} text 
     * @param {*} size 字体大小
     * @param {*} dir x=true y=fasle 方向 
     * @param {*} color 文本颜色
     */
    drawText(ctx, point, text, size = 14, dir, color = "#000") {
        ctx.beginPath();
        const TextWidth = ctx.measureText(text).width;
        let newPoint = [...point];
        if (dir) {
            newPoint = [point[0] / this.scale * this.ratio - TextWidth / 2, -(point[1] / this.scale * this.ratio + size)];
        } else {
            newPoint = [point[0] / this.scale * this.ratio - TextWidth, -(point[1] / this.scale * this.ratio + size / 2)];
        }
        ctx.font = `${size}px Arial`;
        ctx.fillStyle = color;
        ctx.fillText(text, newPoint[0], newPoint[1]);
    };
    /**
     * 绘制圆形
     * @param {*} ctx 
     * @param {*} point 圆心
     * @param {*} r 半径
     * @param {*} color 背景色
     */
    drawArc(ctx, point, r, color = "#E7AC40") {
        ctx.beginPath();
        ctx.arc(point[0] / this.scale * this.ratio, -point[1] / this.scale * this.ratio, r / this.scale * this.ratio, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.closePath();
    };
    /**
     * 绘制矩形
     * @param {*} ctx 
     * @param {*} point 矩形左上角坐标
     * @param {*} width 
     * @param {*} length
     * @param {*} color 背景色
     */
    drawRect(ctx, point, width, length, color = "#FEA400") {
        ctx.beginPath();
        ctx.rect(point[0] / this.scale * this.ratio, -point[1] / this.scale * this.ratio, width / this.scale * this.ratio, length / this.scale * this.ratio);
        ctx.lineWidth = 2;
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.closePath();
    };
    /**
     * 绘制线段
     * @param {*} ctx 
     * @param {*} path [[x,y],[x,y]]
     * @param {*} color 线段颜色
     * @param {*} lineWidth 线宽
     */
    drawLine(ctx, path, color = "#000", lineWidth = 2) {
        if (path.length < 2) return;
        ctx.beginPath();
        for (let i = 0; i < path.length; i++) {
            if (i === 0) {
                ctx.moveTo(path[0][0] / this.scale * this.ratio, -path[0][1] / this.scale * this.ratio)
            } else {
                ctx.lineTo(path[i][0] / this.scale * this.ratio, -path[i][1] / this.scale * this.ratio)
            }
        }
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.stroke();
    };
};