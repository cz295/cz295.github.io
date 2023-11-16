---
layout: page
title: Non-isothermal liquid bridge breakup 
description: Simulation of non-isothermal liquid bridge
img: assets/img/jpthermo.png
importance: 4
category: PhD
related_publications: 
---

<div style='text-align: justify;'>
In general, interfacial tension decreases as the temperature increases. As a result, non-uniform temperature can result in fluid motion along the interface, and eventually flow in the bulk fluid. This is called <b>thermocapillarity</b>. To study thermocapillary flows, we incorporated non-isothermal effects into our Navier-Stokes solver and implemented a heat transfer solver.
</div>

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
We used our method to investigate the thermocapillary driven break-up of a liquid bridge. A group of scientists have studied this problem experimentally in the International Space Station, but numerical simulation enables us to thoroughly investigate the role played by thermocapillary force.
<br/>
<br/>
In an <a href="https://www.youtube.com/watch?v=pPkZWjo8Ow8&ab_channel=MatarFluidsGroup">isothermal scenario</a>, a long liquid thread forms in the middle of the liquid bridge and ends up as a satellite droplet after pinch-off. The break-up shape is symmetrical with respect to the centre of the liquid bridge. With the presence of thermocapillarity, the flow along the interface is towards the warm end, which undoubtedly breaks the up-and-down symmetry. Based on dimensional analysis, three dimensionless numbers are required to define this problem: <i>Oh</i>, <i>Ca</i> and <i>Pr</i>. We studied the effect of <i>Ca</i> number, which represents the relative importance of thermocapillarity. Below shows two distinct break-up shape with a large and small <i>Ca</i> number.
</div>

<div class="row justify-content-center">
<div class = "center">
<div class="col-sm">
{% include figure.html path="assets/img/oh_001_ca_02.png" title="example image" class="img-fluid rounded z-depth-1" %}
</div>
</div>
Temporal evolution of the interface shape and the thermal field in the simulation with Oh = 0.01, Ca = 0.2 and Pr = 5. Thermocapillary flow along the interface is strong in this example, preventing the thinning of the liquid bridge in the warmer end, and it separates the liquid bridge into two parts without satellites droplets.
</div>

<div class="caption">

</div>

<div class="row justify-content-center">
<div class = "center">
<div class="col-sm">
{% include figure.html path="assets/img/oh_001_ca_005.png" title="example image" class="img-fluid rounded z-depth-1" %}
</div>
</div>
Temporal evolution of the interface shape and the thermal field in the simulation with Oh = 0.01, Ca = 0.05 and Pr = 5. Thermocapillary flow is not as strong in this example and this break-up is similar to a non-isothermal liquid bridge breakup with a satellite droplets. Since the thermocapillary flow is towards the upper warmer end, the thinning of the liquid neck in the upper part is delayed and this leads to the asymmetric break-up shape.
</div>
<div class="caption">

</div>


