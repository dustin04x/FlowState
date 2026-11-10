# Code signing policy

Free code signing provided by [SignPath.io](https://about.signpath.io), certificate by [SignPath Foundation](https://signpath.org).

## Team roles

- Authors and committers: [@dustin04x](https://github.com/dustin04x)
- Reviewers: [@dustin04x](https://github.com/dustin04x)
- Approvers: [@dustin04x](https://github.com/dustin04x)

FlowState is maintained by a single developer. Outside changes arrive as pull requests and are reviewed before merge. Every signing request is approved manually by the approver before a release is signed. Maintainers use multi-factor authentication on GitHub.

## Build and release

- Release binaries are built from the public source in this repository by [`.github/workflows/release-packages.yml`](./.github/workflows/release-packages.yml).
- The workflow checks out the release source, runs the tests and type checks, then builds the platform packages.
- The Windows application executable and installer are submitted to SignPath.io for signing before they are attached to the matching GitHub Release.
- Each release requires manual approval in SignPath.io.

## Privacy

FlowState does not transfer any information to other networked systems unless specifically requested by the user or the person installing or operating it. See the [privacy policy](./PRIVACY.md).
