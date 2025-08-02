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
	'hakatashi/hakatabot',
	'hakatashi/hakatabot-firebase-functions',
	'hakatashi/color-of-anime',
	'hakatashi/archive.hakatashi.com',
	'hakatashi/HakataArchiver',
	'hakatashi/esolang-battle',
	'hakatashi/word.hakatashi.com',
	'hakatashi/technically',
	'hakatashi/mahjong.hakatashi.com',
	'hakatashi/namori_rakugaki_annotation',
	'hakatashi/hkt.sh',
	'hakatashi/decathlon',
	'hakatashi/eslint-config',
	'hakatashi/sugoi-converter',
	'hakatashi/Genshin-de-GO',
	'hakatashi/rinna_slackbot',
	'hakatashi/it-quiz',
	'hakatashi/solid-start-firebase-template',
	'hakatashi/activitypub-firebase',
	'hakatashi/it-quiz-shorts',
	'tsg-ut/achievement-viewer',
	'tsg-ut/ctfd-theme-tsgctf',
	'tsg-ut/arc-codegolf',
];

const getTemplate = (repo: string) => {
	return stripIndent`
		name: automerge
		on: pull_request_target

		jobs:
		  dependabot:
		    runs-on: ubuntu-latest
		    if: github.event.pull_request.user.login == 'dependabot[bot]' && github.repository == '${repo}'
		    steps:
		      - name: Dependabot metadata
		        id: metadata
		        uses: dependabot/fetch-metadata@v2
		        with:
		          github-token: "\${{ secrets.USER_GITHUB_TOKEN }}"
		      - name: Enable auto-merge for Dependabot PRs
		        run: gh pr merge --auto --merge "$PR_URL"
		        env:
		          PR_URL: \${{ github.event.pull_request.html_url }}
		          GH_TOKEN: \${{ secrets.USER_GITHUB_TOKEN }}
	`;
};

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

		/*
		console.log('Getting workflows...');
		const {data: {workflows}} = await github.actions.listRepoWorkflows({
			owner,
			repo,
		});

		const checks = workflows.map((workflow) => workflow.name).filter((name) => name !== 'automerge');
		console.log(`Required checks: ${JSON.stringify(checks)}`);

		if (checks.length > 0) {
			console.log(`Updating branch protection rule...`);
			const {data: protection} = await github.repos.updateBranchProtection({
				owner,
				repo,
				branch: defaultBranch,
				required_status_checks: {
					strict: false,
					contexts: checks,
				},
				enforce_admins: false,
				required_pull_request_reviews: null,
				restrictions: null,
			});
		}
		*/

		console.log('Updating repository to enable allow_auto_merge...');
		const {data: repoUpdate} = await github.repos.update({
			owner,
			repo,
			allow_auto_merge: true,
		});
		console.log(`done. (allow_auto_merge = ${repoUpdate.allow_auto_merge})`);

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
					content: getTemplate(repoString),
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
