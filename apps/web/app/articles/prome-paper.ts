import type { Article, ArticleText } from "./data";

const pair = (zh: string, en: string): ArticleText => ({ zh, en });

export const promePaper: Article = {
  slug: "prome-group-robust-learning",
  titleZh: "ProME：用于群体鲁棒学习的原型边际环境与修复感知选择",
  titleEn:
    "ProME: Prototype-Margin Environments with Repair-Aware Selection for Group-Robust Learning",
  summaryZh:
    "ProME 将无训练群体标签的群体鲁棒学习表述为“内生环境与修复感知选择”问题：沿同一表示学习轨迹用原型边际构造环境，再以修复后的分类器评价并选择最终部署模型。",
  summaryEn:
    "ProME formulates group-robust learning without training-group labels as endogenous environments with repair-aware selection: prototype margins construct environments along the representation trajectory, and repaired classifiers determine which predictor is deployed.",
  sourceLabelZh: "arXiv:2608.13190 · 论文原文",
  sourceLabelEn: "arXiv:2608.13190 · Original paper",
  sourceHref: "https://arxiv.org/abs/2608.13190",
  coverImage: "/media/prome-framework.webp",
  coverAltZh: "ProME 论文中的两阶段训练、分类器修复与部署流程图",
  coverAltEn:
    "The two-stage ProME training, classifier-repair and deployment framework from the paper",
  sections: [
    {
      headingZh: "论文信息与研究问题",
      headingEn: "Paper and research question",
      blocks: [
        {
          type: "paragraph",
          ...pair(
            "论文由 Qianqian Wang、Yunshan Li、Dawei Huang、Wenwu Gong 与 Lili Yang 完成，作者来自南方科技大学统计与数据科学系及深圳市下一代工业互联网安全技术重点实验室。arXiv v1 于 2026 年 8 月 13 日提交。",
            "The paper is authored by Qianqian Wang, Yunshan Li, Dawei Huang, Wenwu Gong and Lili Yang from the Department of Statistics and Data Science at Southern University of Science and Technology and the Shenzhen Key Laboratory of Safety and Security for Next Generation of Industrial Internet. arXiv v1 was submitted on 13 August 2026.",
          ),
        },
        {
          type: "paragraph",
          ...pair(
            "群体鲁棒学习关注最弱子群体的性能。训练数据中的稀有群体占比很低时，经验风险最小化可能依赖背景、性别或颜色等捷径特征，在总体准确率较高的同时留下很低的最差群体准确率（WGA）。完整标注每个训练样本的群体身份通常代价高昂，因此本文研究在训练阶段没有群体标签时如何构造有效环境并选择最终预测器。",
            "Group-robust learning protects the weakest subpopulation. When rare groups are underrepresented, empirical risk minimization can rely on shortcuts such as background, gender or colour, producing strong average accuracy but poor worst-group accuracy (WGA). Because annotating every training example with a group identity is often impractical, the paper asks how to construct useful environments and select a deployable predictor without training-group labels.",
          ),
        },
        {
          type: "subheading",
          ...pair("两个部署错位", "Two deployment misalignments"),
        },
        {
          type: "list",
          items: [
            pair(
              "环境—表示错位：已有流程常用独立参考模型推断固定环境，再训练另一个表示；环境不再跟随正在优化的表示。",
              "Environment–representation mismatch: a detached reference model often infers a fixed partition for a different representation trained later.",
            ),
            pair(
              "修复前选择错位：某个编码器的原始分类头可能表现不佳，但在最后一层修复后反而最好；按修复前 WGA 或最后检查点选择会丢掉它。",
              "Pre-repair selection mismatch: an encoder with a weak original head may become the best candidate after last-layer repair, so pre-repair WGA or the final checkpoint can select the wrong model.",
            ),
          ],
        },
        {
          type: "paragraph",
          ...pair(
            "为同时处理这两种错位，论文提出 ERAS（Endogenous Environments with Repair-Aware Selection）：环境必须来自随后被其正则化的同一训练轨迹，候选模型必须在装上与部署一致的修复分类头之后再比较。",
            "To address both mismatches, the paper introduces ERAS—Endogenous Environments with Repair-Aware Selection. Environments must come from the same trajectory they later regularize, and candidates must be compared only after receiving the repaired classifier used for deployment.",
          ),
        },
      ],
    },
    {
      headingZh: "阶段一：原型边际环境学习",
      headingEn: "Stage 1: prototype-margin environment learning",
      blocks: [
        {
          type: "paragraph",
          ...pair(
            "ProME 先用余弦原型分类器完成 ERM 预热。归一化表示的每个类别由其平均表示形成类别原型；预测方向与两个类别原型之差一致。原型会按固定间隔由当前表示重新计算，但本身不参与梯度更新。",
            "ProME begins with an ERM warm-up using a cosine-prototype classifier. Each class prototype is the normalised mean of its representations, and the prediction direction follows the contrast between the two class prototypes. Prototypes are periodically recomputed from the current representation but are not gradient-updated parameters.",
          ),
        },
        {
          type: "subheading",
          ...pair("原型边际", "Prototype margin"),
        },
        {
          type: "code",
          language: "text",
          code: "s(x; y) = cos(phi(x), mu_y) - cos(phi(x), mu_(1-y))",
        },
        {
          type: "paragraph",
          ...pair(
            "这个分数衡量样本表示对真实类别原型的相对支持。边际越小，类别支持越弱或越冲突。ProME 在整个训练集上用边际中位数切分出低边际和高边际两个近似平衡的环境，不需要预先知道真实群体比例。",
            "This score measures how strongly the representation supports the observed class relative to its competitor. A smaller margin indicates weaker or conflicting class support. A global median split creates approximately balanced low- and high-margin environments without assuming the true group proportions.",
          ),
        },
        {
          type: "paragraph",
          ...pair(
            "在推断环境上，阶段一同时最小化平均环境风险、IRMv1 梯度惩罚与 REx 风险方差惩罚。标准 ProME 在预热后固定一次分区；ProME-Refresh 则在原型刷新时重新计算分区。两者使用相同目标，只在分区更新频率上不同。训练过程中按里程碑保留编码器检查点，并加入修复前验证 WGA 最好的检查点，形成候选集合。",
            "Across the inferred environments, Stage 1 minimises mean environment risk together with IRMv1 and REx penalties. Standard ProME fixes the post-warm-up partition, whereas ProME-Refresh recomputes it whenever prototypes are refreshed. Both use the same objective and differ only in update frequency. Milestone encoders and the checkpoint with the best pre-repair validation WGA form the candidate pool.",
          ),
        },
      ],
    },
    {
      headingZh: "阶段二：分类器修复与候选选择",
      headingEn: "Stage 2: classifier repair and candidate selection",
      blocks: [
        {
          type: "paragraph",
          ...pair(
            "对每个候选编码器，ProME 丢弃阶段一的投影层和原型分类头，冻结编码器，并在带群体标注的验证集上拟合一个群体平衡的线性 DFR 分类头。各验证群体在目标函数中权重相同，L2 正则强度通过五折交叉验证选择。",
            "For every candidate encoder, ProME removes the Stage 1 projection and prototype head, freezes the encoder, and fits a group-balanced linear DFR head on group-annotated validation data. Every validation group receives equal weight, and five-fold cross-validation chooses the L2 regularisation strength.",
          ),
        },
        {
          type: "list",
          ordered: true,
          items: [
            pair("冻结每个候选编码器。", "Freeze each candidate encoder."),
            pair(
              "为每个候选独立拟合同一族的群体平衡线性分类头。",
              "Fit the same family of group-balanced linear heads independently for every candidate.",
            ),
            pair(
              "用修复后的验证 WGA 对编码器—分类头组合排序。",
              "Rank the repaired encoder–head pairs by validation WGA.",
            ),
            pair(
              "只部署得分最高的一对模型；候选搜索全部离线完成。",
              "Deploy only the highest-scoring pair; candidate search remains offline.",
            ),
          ],
        },
        {
          type: "paragraph",
          ...pair(
            "阶段一的表示学习不使用训练群体标签。带群体标注的验证数据用于候选跟踪、分类头拟合、正则调参与最终选择，但不反向更新阶段一表示。测试群体标签只用于报告 WGA，不参与预测或选择。",
            "Stage 1 representation learning uses no training-group labels. Group-annotated validation data support candidate tracking, head fitting, regularisation tuning and final selection, but do not update the Stage 1 representation. Test-group labels are used only to report WGA, never for prediction or selection.",
          ),
        },
      ],
    },
    {
      headingZh: "理论结果与适用边界",
      headingEn: "Theory and scope",
      blocks: [
        {
          type: "list",
          items: [
            pair(
              "原型边际恒等式：在二分类设定下，边际与训练分类器的 logit 共享同一条线性方向。",
              "Prototype-margin identity: in the binary setting, the margin and the training logit share the same linear direction.",
            ),
            pair(
              "捷径冲突分离：在论文给出的因果—捷径正交分解、正系数与有界投影噪声条件下，捷径冲突样本具有更低边际；当冲突样本不超过一半时，中位数低边际单元会富集这些样本。",
              "Shortcut-conflict separation: under the paper's causal–shortcut decomposition, positive coefficients and bounded projected noise, shortcut-conflicting samples receive smaller margins; when they are at most half the data, the median low-margin cell enriches them.",
            ),
            pair(
              "内生分区稳定性：当表示发生有界变化时，原型、边际和中位数也有界变化，只有原中位数附近的样本可能切换环境。",
              "Endogenous-partition stability: bounded representation changes induce bounded changes in prototypes, margins and the median, so only samples near the former median can switch environments.",
            ),
            pair(
              "风险控制：固定预测器和 K 个推断环境时，最坏环境风险不超过平均风险加上 sqrt((K - 1) × REx)。若每个真实群体都与某个推断环境满足总变差距离不超过 rho，边界再增加 B × rho 后可转移到真实群体。",
              "Risk control: for a fixed predictor and K inferred environments, worst-environment risk is at most mean risk plus sqrt((K - 1) × REx). If every oracle group lies within total-variation distance rho of a matched inferred cell, adding B × rho transfers the bound to oracle groups.",
            ),
          ],
        },
        {
          type: "paragraph",
          ...pair(
            "这些结论都带有明确条件。论文特别说明：理论没有声称有限样本下从经验风险到总体风险的保证；总变差转移结论也是条件性的。阶段二的修复感知选择主要由实验验证。",
            "These statements are conditional. The paper explicitly does not claim a finite-sample empirical-to-population guarantee, and the total-variation transfer is conditional as well. Repair-aware selection in Stage 2 is supported primarily by experiments.",
          ),
        },
      ],
    },
    {
      headingZh: "实验设计与主要结果",
      headingEn: "Experiments and main results",
      blocks: [
        {
          type: "paragraph",
          ...pair(
            "实验覆盖 Waterbirds（鸟类与背景）、CelebA（金发与性别）、CivilComments（毒性与身份子群体）以及受控的 ColoredMNIST（数字奇偶与颜色捷径）。前两个视觉数据集使用 ImageNet 预训练 ResNet-50，CivilComments 使用 BERT-base-uncased，ColoredMNIST 使用三层卷积网络。",
            "Experiments cover Waterbirds (bird type and background), CelebA (blond hair and gender), CivilComments (toxicity across identity subpopulations), and controlled ColoredMNIST (digit parity and a colour shortcut). The visual datasets use ImageNet-pretrained ResNet-50, CivilComments uses BERT-base-uncased, and ColoredMNIST uses a three-layer convolutional network.",
          ),
        },
        {
          type: "subheading",
          ...pair("总体比较", "Headline comparison"),
        },
        {
          type: "paragraph",
          ...pair(
            "在与 ProME 具有相同群体标签访问级别——验证群体标签用于分类器拟合和选择——的方法中，ProME 在 Waterbirds、CelebA、CivilComments 上分别报告 93.1±0.3%、89.3±0.5% 与 78.7±0.2% 的 WGA，三者未加权平均为 87.0%。表中同访问级别最强基线 GSR 的平均值为 83.9%，差 3.1 个百分点。",
            "Among methods with the same group-label access—validation groups used for classifier fitting and selection—ProME reports WGA of 93.1±0.3% on Waterbirds, 89.3±0.5% on CelebA and 78.7±0.2% on CivilComments, for an unweighted average of 87.0%. GSR, the strongest baseline at that access level in the table, averages 83.9%, a 3.1-point difference.",
          ),
        },
        {
          type: "paragraph",
          ...pair(
            "这张主表引用各基线原论文的原始协议，因此属于已发表结果的横向报告，而不是完全统一设置下的受控复现。论文随后用匹配设置检验两个对齐机制。",
            "The headline table takes baseline entries from their published protocols, so it is a reported cross-protocol comparison rather than a fully controlled reproduction. The paper then uses matched settings to test the two alignment mechanisms.",
          ),
        },
        {
          type: "subheading",
          ...pair("机制分析", "Mechanism analyses"),
        },
        {
          type: "list",
          items: [
            pair(
              "Waterbirds 全局中位数分区中，捷径冲突样本占低边际环境的 0.68、占高边际环境的 0.01。",
              "Under the Waterbirds global-median split, shortcut-conflicting examples make up 0.68 of the low-margin environment and 0.01 of the high-margin environment.",
            ),
            pair(
              "在匹配的分区来源比较中，轨迹实时边际将修复前 WGA 从冻结参考模型的 68.95±3.39% 提高到 78.85±3.56%；经过匹配修复后，两者分别为 90.34±1.75% 与 90.60±0.95%。",
              "In the matched source comparison, live trajectory margins raise pre-repair WGA from 68.95±3.39% for a frozen reference to 78.85±3.56%; after matched repair, the two finish at 90.34±1.75% and 90.60±0.95%.",
            ),
            pair(
              "分类器修复显著重排候选：Waterbirds 四个阶段一变体的跨度从修复前 12.20 点收窄到修复后 1.25 点；CivilComments 从 9.98 点收窄到 0.34 点。",
              "Classifier repair substantially reshapes candidate evaluation: the spread across four Stage 1 variants contracts from 12.20 to 1.25 points on Waterbirds and from 9.98 to 0.34 points on CivilComments.",
            ),
            pair(
              "CelebA 上，修复后单检查点为 86.94%，里程碑候选池为 89.31%，随机候选池为 89.87%，说明多候选修复后选择优于固定单检查点。",
              "On CelebA, post-repair WGA is 86.94% for a single checkpoint, 89.31% for milestone candidates and 89.87% for random candidates, showing the value of selecting across multiple repaired candidates.",
            ),
          ],
        },
      ],
    },
    {
      headingZh: "结论、监督预算与复现说明",
      headingEn: "Conclusion, supervision budget and reproducibility",
      blocks: [
        {
          type: "paragraph",
          ...pair(
            "ProME 的核心设计原则是让训练环境与正在学习的表示同轨，让模型选择与真正部署的修复预测器同口径。它不需要训练群体标签，候选搜索离线完成，线上只部署一个编码器和一个线性分类头；但它并非完全不使用群体监督，因为阶段二明确需要带群体标注的验证集。",
            "ProME's central design principle is to align training environments with the representation trajectory and model selection with the repaired predictor that is actually deployed. It needs no training-group labels, performs candidate search offline, and deploys one encoder with one linear head; it is not fully group-label-free, because Stage 2 explicitly requires group-annotated validation data.",
          ),
        },
        {
          type: "paragraph",
          ...pair(
            "验证群体标签的价值与少数群体支持量有关：在最小训练群体仅 56 个样本的 Waterbirds 上，使用验证群体数据修复比使用训练群体数据高 18.68 点；CelebA 最小群体有 1,387 个样本，差距为 1.83 点。三项真实数据集在固定十个随机种子下的 WGA 标准差为 0.62、0.51 与 0.30 点，但 ColoredMNIST 的标准差为 5.48 点，因此论文只对真实数据集给出种子稳定性结论。",
            "The value of validation-group labels depends on minority support. On Waterbirds, whose smallest training group has only 56 examples, validation-based repair is 18.68 points above training-based repair; on CelebA, whose smallest group has 1,387 examples, the gap is 1.83 points. Across ten fixed seeds, WGA standard deviations are 0.62, 0.51 and 0.30 points on the three real-world datasets, but 5.48 points on ColoredMNIST, so the paper limits its seed-stability conclusion to the real-world benchmarks.",
          ),
        },
        {
          type: "paragraph",
          ...pair(
            "论文声明三个真实数据集来自公开来源，ColoredMNIST 按文中协议由 MNIST 生成；代码将在论文被接收后公开。当前页面因此只链接已公开的 arXiv 原文，不虚构尚未发布的代码仓库。",
            "The paper states that the three real-world datasets are publicly available and that ColoredMNIST is generated from MNIST under its protocol. The code will be made public upon acceptance. This page therefore links only the available arXiv paper and does not invent an unreleased repository.",
          ),
        },
      ],
    },
  ],
};
