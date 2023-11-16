---
layout: page
title: Non-isothermal liquid bridge breakup 
description: Simulation of non-isothermal liquid bridge
img: assets/img/jpthermo.png
importance: 4
category: PhD
related_publications: 
---


<div class="row justify-content-center">
<div class = "center">
<video width="650" height="480" controls="controls">
  <source src="https://arxiv.org/src/1210.4073v1/anc/Gallery_of_Fluid_Motion_016.mp4" type="video/mp4" />
  Your browser does not support the video tag.
  /* instead of the last line you could also add the flash player*/
</video>
</div>
</div>
<div class="caption">
This video shows the experimental study of a liquid bridge breakup driven by thermocapillarity. This was conducted by <a href="https://arxiv.org/abs/1210.4073">Ueno et al.
(2012) </a> in the International Space Station.
</div>

<div style='text-align: justify;'>
In general, interfacial tension decreases as the temperature increases. As a result, non-uniform temperature can result in fluid motion along the interface, and eventually flow in the bulk fluid. This is called <b>thermocapillarity</b>. To study thermocapillary flows, we incorporated non-isothermal effects into our Navier-Stokes solver and implemented a heat transfer solver.
<br/>
<br/>
We used our method to investigate the thermocapillary driven break-up of a liquid bridge. A group of scientists have studied this problem experimentally in the International Space Station, but numerical simulation enables us to thoroughly investigate the role played by thermocapillary force.
<br/>
<br/>
Based on dimensional analysis, three dimensionless numbers are required to define this problem: <i>Oh</i>, <i>Ca</i> and <i>Pr</i>. We explored the parameter spaces of <i>Oh</i> and <i>Ca</i>. Three distinct break-up regime were identified. 
</div>


<div class="row justify-content-center">
<div class = "center">
<div class="col-sm">
{% include figure.html path="assets/img/gen_mesh.png" title="example image" class="img-fluid rounded z-depth-1" %}
</div>
</div>
</div>
<div class="caption">
Mesh generation: The goal is to generate a circular interface (drawn in red). We started with just 3 nodes on the interface and gradually refined the mesh. In the final mesh, the region near the interface has much lower mesh size.
</div>


