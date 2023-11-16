---
layout: page
title: Adaptive moving mesh 
description: Adaptive moving mesh
img: assets/img/meshing.gif
importance: 1
category: PhD
related_publications: 
---

The interface is the key factor in the numerical simulation of multiphase flows. We adopted an approach to track the interface explicitly and developped an adaptive moving mesh generator to follow the interface evolution. The computational mesh is constantly refined or coarsened based on the shape of the interface. 

<div class="row justify-content-center">
<div class = "center">
<div class="col-sm">
{% include figure.html path="assets/img/gen_mesh.png" title="example image" class="img-fluid rounded z-depth-1" %}
</div>
</div>
</div>
<div class="caption">
Mesh generation: The goal is to generate a circular interface (drawn in blue). 
</div>

<div class="row justify-content-center">
<div class = "center">
<div class="col-sm">
{% include figure.html path="assets/img/meshing.gif" title="example image" class="img-fluid rounded z-depth-1" %}
</div>
</div>
</div>
<div class="caption">
Constant remeshing to track the movement of a droplet (interface in blue).
</div>


