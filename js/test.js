var chart = function(){
  const div = d3.create('div');

  const svgChart = div
    .append('svg')
    .attr('width', config.viewWidth)
    .attr('height', config.viewHeight);

  const gCam = svgChart.append('g');

  const stageChart = gCam
    .append('g')
    .attr(...ttrans(config.margin, config.margin));

  const svgMinimap = div
    .append('svg')
    .attr('width', minimapScaleX(config.minimapScale)(config._width))
    .attr('height', minimapScaleY(config.minimapScale)(config._height))
    .attr('viewBox', [0, 0, config._width, config._height].join(' '))
    .attr('preserveAspectRatio', 'xMidYMid meet');

  svgChart.append('g').attr(...ttrans(config.margin, config.margin));

  svgMinimap
    .append('rect')
    .attr('width', config._width)
    .attr('height', config._height)
    .attr('fill', 'pink');

  const stageMinimap = svgMinimap
    .append('g')
    .attr(...ttrans(config.margin, config.margin));

  function onZoom() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush")
      return null;
    const t = d3.event.transform;
    console.log('onZoom', d3.event);
    gCam.attr(...ttrans(t.x, t.y, t.k));
    //prevent brush invoked event

    console.log(t.x, t.y);
    const scaleX = minimapScaleX(t.k);
    const scaleY = minimapScaleY(t.k);
    brush.move(gBrush, [
      [scaleX.invert(-t.x), scaleY.invert(-t.y)],
      [
        scaleX.invert(-t.x + config.viewWidth),
        scaleY.invert(-t.y + config.viewHeight)
      ]
    ]);
  }

  // WARNING: *world size* should be larger than or equal to *viewport size*
  // if the world is smaller than viewport, the zoom action will yield weird coordinates.
  const worldWidth =
    config._width > config.viewWidth ? config._width : config.viewWidth;
  const worldHeight =
    config._height > config.viewHeight ? config._height : config.viewHeight;
  const zoom = d3
    .zoom()
    .scaleExtent([.2, 1]) // smaller front, larger latter
    .translateExtent([[0, 0], [worldWidth, worldHeight]]) // world extent
    .extent([[0, 0], [config.viewWidth, config.viewHeight]]) // viewport extent
    .on('zoom', onZoom);

  const gBrush = svgMinimap.append('g');

  function onBrush() {
    // prevent zoom invoked event
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom")
      return null;
    if (Array.isArray(d3.event.selection)) {
      const [[brushX, brushY], [brushX2, brushY2]] = d3.event.selection;
      const zoomScale = d3.zoomTransform(svgChart.node()).k;
      console.log('brush', {
        brushX,
        brushY,
        zoomScale
      });

      const scaleX = minimapScaleX(zoomScale);
      const scaleY = minimapScaleY(zoomScale);

      svgChart.call(
        zoom.transform,
        d3.zoomIdentity.translate(-brushX, -brushY).scale(zoomScale)
      );
      console.log('zoom object');
      gCam.attr(...ttrans(scaleX(-brushX), scaleY(-brushY), zoomScale));
    }
  }

  const brush = d3
    .brush()
    .extent([[0, 0], [config._width, config._height]])
    .on('brush', onBrush);

  function render() {
    stageChart
      .selectAll('path')
      .data(data)
      .join('path')
      .attr('d', lineGen);

    stageMinimap
      .selectAll('path')
      .data(data)
      .join('path')
      .attr('d', lineGen);

    svgChart.call(zoom);
    gBrush.call(brush);

    brush.move(gBrush, [
      [0, 0],
      [
        config._width * config.minimapScale,
        config._height * config.minimapScale
      ]
    ]);
    svgMinimap.selectAll('.handle').remove();
    svgMinimap.selectAll('.overlay').remove();
  }

  return Object.assign(div.node(), { render });
}