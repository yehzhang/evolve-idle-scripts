tech_graph() {
  node -r ts-node/register ./graphTechnologyTree.ts $@ | dot -T svg > tech-graph.svg
}

$@
