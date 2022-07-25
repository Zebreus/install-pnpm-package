import { PeerDependencyIssues } from "@pnpm/core"

type PeerDependencyIssue = {
  package: string
  wantedVersion: string
  wantedBy: { package: string; version: string }[]
  installedVersion?: string
  optional: boolean
}

/** Reduce pnpm PeerDependencyIssues to a single array*/
export const simplifyPeerDependencyIssues = (issues: PeerDependencyIssues) => {
  const peerDepIssues = [...Object.entries(issues.bad), ...Object.entries(issues.missing)].flatMap(([name, issues]) =>
    issues.map(
      issue =>
        ({
          package: name,
          wantedVersion: issue.wantedRange,
          wantedBy: issue.parents.map(({ name, version }) => ({ package: name, version })),
          installedVersion: (issue as unknown as { foundVersion: string | undefined }).foundVersion,
          optional: issue.optional,
        } as PeerDependencyIssue)
    )
  )

  return peerDepIssues
}
