import {Octokit} from '@octokit/rest';
import dotenv from 'dotenv';
import {stripIndent} from 'common-tags';
import sodium from 'tweetsodium';

dotenv.config();

const github = new Octokit({
	auth: process.env.GITHUB_TOKEN,
});

const repos = [
	'hakatashi/sandbox',
	'hakatashi/decapsulate',
	'hakatashi/nine-grids-shogi-analyzer',
	'hakatashi/coupling.moe',
	'hakatashi/slack-ikku',
	'hakatashi/pixiv2aozora.js',
	'hakatashi/tsg-ai-arena',
	'hakatashi/flag-matcher',
	'hakatashi/slackbot-anime-thumber',
	'hakatashi/pentest',
	'hakatashi/api.hakatashi.com',
	'hakatashi/hakatabot-heroku',
	'hakatashi/hakatabot',
	'hakatashi/hakatabot-firebase-functions',
	'hakatashi/color-of-anime',
	'hakatashi/archive.hakatashi.com',
	'hakatashi/HakataArchiver',
	'tsg-ut/achievement-viewer',
	'tsg-ut/ctfd-theme-tsgctf',
];

const template = stripIndent`
  name: automerge
  on:
    pull_request:
      types:
        - labeled
        - unlabeled
        - synchronize
        - opened
        - edited
        - ready_for_review
        - reopened
        - unlocked
    pull_request_review:
      types:
        - submitted
    check_suite:
      types:
        - completed
    status: {}
  jobs:
    automerge-snyk:
      runs-on: ubuntu-latest
      steps:
        - name: automerge Snyk
          uses: "pascalgn/automerge-action@v0.12.0"
          env:
            GITHUB_TOKEN: "\${{secrets.USER_GITHUB_TOKEN}}"
            MERGE_FORKS: false
            MERGE_DELETE_BRANCH: true
            MERGE_FILTER_AUTHOR: snyk-bot
            MERGE_LABELS: ''
    automerge-dependabot:
      runs-on: ubuntu-latest
      steps:
        - name: automerge Dependabot
          uses: "pascalgn/automerge-action@v0.12.0"
          env:
            GITHUB_TOKEN: "\${{secrets.USER_GITHUB_TOKEN}}"
            MERGE_FORKS: false
            MERGE_DELETE_BRANCH: true
            MERGE_FILTER_AUTHOR: ''
            MERGE_LABELS: dependencies
`;

(async () => {
	const date = new Date().toISOString();

	for (const repoString of repos) {
		console.log(`Processing ${repoString}...`);
		const [owner, repo] = repoString.split('/');

		console.log('Getting default branch...');
		const {data: repoInfo} = await github.repos.get({owner, repo});
		const defaultBranch = repoInfo.default_branch;

		console.log('Getting repository public key...');
		const {data: pubkey} = await github.actions.getRepoPublicKey({owner, repo});

		const messageBytes = Buffer.from(process.env.GITHUB_TOKEN);
		const keyBytes = Buffer.from(pubkey.key, 'base64');
		const encryptedBytes = sodium.seal(messageBytes, keyBytes);
		const encrypted = Buffer.from(encryptedBytes).toString('base64');

		console.log('Putting repository secret USER_GITHUB_TOKEN...');
		const {data: secrets} = await github.actions.createOrUpdateRepoSecret({
			owner,
			repo,
			key_id: pubkey.key_id,
			secret_name: 'USER_GITHUB_TOKEN',
			encrypted_value: encrypted,
		});

		console.log('Getting commit hash...');
		const {data: ref} = await github.git.getRef({owner, repo, ref: `heads/${defaultBranch}`})
		const commitHash = ref.object.sha;

		console.log('Getting tree hash...');
		const {data: commit} = await github.repos.getCommit({owner, repo, ref: commitHash});

		console.log('Creating new tree...');
		const {data: tree} = await github.git.createTree({
			owner,
			repo,
			base_tree: commit.commit.tree.sha,
			tree: [
				{
					path: '.github/workflows/automerge.yml',
					mode: '100644',
					type: 'blob',
					content: template,
				},
			],
		});

		console.log('Creating new commit...');
		const {data: newCommit} = await github.git.createCommit({
			owner,
			repo,
			message: 'BOT: Synchronize .github/workflows/automerge.yml',
			author: {
				name: 'Koki Takahashi',
				email: 'hakatasiloving@gmail.com',
				date,
			},
			parents: [ref.object.sha],
			tree: tree.sha,
		});

		console.log('Updating ref...');
		const {data: newRef} = await github.git.updateRef({
			owner,
			repo,
			sha: newCommit.sha,
			force: false,
			ref: `heads/${defaultBranch}`,
		});

		console.log(`done. (commit = ${newRef.object.sha})`);
	}
})();