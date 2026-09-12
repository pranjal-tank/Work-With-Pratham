export function getProjectSections(projects, subsections, category = 'all') {
  const visibleProjects = projects.filter(
    (project) => category === 'all' || project.category === category,
  )
  const projectsById = new Map(visibleProjects.map((project) => [project.id, project]))
  const assigned = new Set()
  const groups = []

  for (const subsection of subsections) {
    if (category !== 'all' && subsection.category !== category) continue
    const members = []
    for (const id of subsection.projectIds) {
      const project = projectsById.get(id)
      if (!project || project.category !== subsection.category || assigned.has(id)) continue
      members.push(project)
      assigned.add(id)
    }
    if (members.length) groups.push({ ...subsection, projects: members })
  }

  const ungrouped = visibleProjects.filter((project) => !assigned.has(project.id))
  return [...(ungrouped.length ? [{ id: 'ungrouped', projects: ungrouped }] : []), ...groups]
}
