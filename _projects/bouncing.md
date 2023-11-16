---
layout: page
title: Droplet collision 
description: Simulation of binary droplet head-on collision
img: assets/img/bounce.gif
importance: 3
category: PhD
related_publications: 
---
<div style='text-align: justify;'>
Droplet collision occurs frequently in many natural and industrial processes, for example, the formation of raindrops, spray and atomisation. This problem 
can be characterised by a dimensionless number, the <i>Weber</i> number. Experimental studies on the head-on collision of droplets of equal size have 
identified four distinct outcomes with increasing values of <i> We </i> number: 1) coalescence after minor deformation; 2) bouncing; 3) coalescence after large
deformation; and 4) coalescence followed by separation with the generation of secondary droplets. Our simulation focused on the transition from region 1) 
to regime 2).
<br/>
<br/>
The gas film between the two droplets play an important role. As the gas film is squeezed by the droplet, rarefied gas effect become important and this will 
prevent the two droplets getting closer. But once the distance between the two droplet gets lower than the mean free path, <i>van der Waals</i> force becomes 
dominant and leads to an inevitable coalescence outcome. To accurately simulate this problem, it is required that the rarefied gas effect and <i> van der Waals</i> 
force are modelled correctly, and the computational mesh is required to resolve a large disparity in length scales from millimetre to nanometre.
<br/>
<br/>
Our numerical method correctly identified the threshold <i>We</i> number and the simulation results fit the experimental results to a satisfactory level. 
</div>

<b>Droplet coalescence after minor deformation</b>

<div class="row justify-content-center">
<div class = "center">
<div class="col-sm">
{% include figure.html path="assets/img/merge.png" title="example image" class="img-fluid rounded z-depth-1" %}
</div>
</div>
</div>
<div class="caption">
Simulated sequences (in red) of the head-on collision of binary
tetradecane in air at atmospheric pressure superposed onto the experimental results by <a href="https://pubs.aip.org/aip/jap/article-abstract/103/6/064901/284444/Experimental-and-mechanistic-description-of?redirectedFrom=fulltext">Pan et al. (2008) </a>. The diameter D = 214.4 µm, the relative impact velocity is V = 0.604 m/s and We = 2.25.
</div>

<b>Droplet bouncing</b>

<div class="row justify-content-center">
<div class = "center">
<div class="col-sm">
{% include figure.html path="assets/img/merge_mesh.png" title="example image" class="img-fluid rounded z-depth-1" %}
</div>
</div>
</div>
<div class="caption">
The computational mesh before and after droplet coalescence.
</div>


<div class="row justify-content-center">
<div class = "center">
<div class="col-sm">
{% include figure.html path="assets/img/bounce.png" title="example image" class="img-fluid rounded z-depth-1" %}
</div>
</div>
</div>
<div class="caption">
The simulated interface is drawn in red solid lines and is superposed
on the experimental results by <a href="https://pubs.aip.org/aip/jap/article-abstract/103/6/064901/284444/Experimental-and-mechanistic-description-of?redirectedFrom=fulltext">Pan et al. (2008) </a>. In this example, the ambient
gas is air at atmospheric pressure, the diameter is D = 341.2 µm, the relative
impact velocity V = 0.229 m/s and W e = 2.27.
</div>

<div class="row justify-content-center">
<div class = "center">
<div class="col-sm">
{% include figure.html path="assets/img/bounce.gif" title="example image" class="img-fluid rounded z-depth-1" %}
</div>
</div>
</div>
<div class="caption">
Animation of binary droplet collision with a bounce outcome (from the above simulation).
</div>


