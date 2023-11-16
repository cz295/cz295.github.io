---
layout: page
title: Adaptive moving mesh 
description: Adaptive moving mesh
img: assets/img/meshing.gif
importance: 1
category: PhD
related_publications: 
---
<div style='text-align: justify;'>
In multiphase flows, the key factor is the presence of an interface separating different phases. Many physical properties, for example density and viscosity, are discontinuous across the interface. The interface also possesses localised properties including the interfacial tension. Furthermore, owing to the fact that the interface is a moving boundary, the evolution of the interface is coupled with the velocity field and pressure, and all of these must be determined simultaneously.
<br/>
<br/>
We adopted an approach to track the interface explicitly on a unstructured triangular mesh. An adaptive moving mesh generator was developped to follow the interface evolution and to constanly refine/coarse the compuational mesh. In general, finer mesh is required near the interface as interfacial tension is the driving force in problems we interested in. Applying a coarser mesh in regions far away from the interface also reduces the computing costs.
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


