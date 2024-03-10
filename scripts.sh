tech_graph() {
  node -r ts-node/register ./techTree/graphTechnologyTree.ts $@ | dot -T svg > tech-graph.svg
}

$@
