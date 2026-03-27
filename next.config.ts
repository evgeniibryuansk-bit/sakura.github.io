import type { NextConfig } from "next";

const fallbackRepository = "evgeniibryuansk-bit/sakura.github.io";
const fallbackOwner = "evgeniibryuansk-bit";

function resolveRepoBasePath(repository: string, owner: string) {
  const [repositoryOwner, repositoryName] = repository.includes("/")
    ? repository.split("/", 2)
    : [owner, repository];
  const normalizedOwner = (repositoryOwner || owner || fallbackOwner).toLowerCase();
  const normalizedRepository = (repositoryName || repository || "").toLowerCase();

  if (!normalizedRepository) {
    return "";
  }

  return normalizedRepository === `${normalizedOwner}.github.io`
    ? ""
    : `/${normalizedRepository}`;
}

const githubRepository = process.env.GITHUB_REPOSITORY ?? fallbackRepository;
const githubOwner = process.env.GITHUB_REPOSITORY_OWNER ?? fallbackOwner;
const repoBasePath = resolveRepoBasePath(githubRepository, githubOwner);

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_REPO_BASE_PATH: repoBasePath,
  },
  ...(repoBasePath
    ? {
        basePath: repoBasePath,
        assetPrefix: `${repoBasePath}/`,
      }
    : {}),
};

export default nextConfig;
