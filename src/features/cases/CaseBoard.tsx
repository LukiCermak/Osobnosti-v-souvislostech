import { Button } from '@/components/shared/Button';
import { Card } from '@/components/shared/Card';
import { ProgressBadge } from '@/components/shared/ProgressBadge';
import { CaseClueList } from '@/features/cases/CaseClueList';
import { CaseSummary } from '@/features/cases/CaseSummary';
import type { CaseRecord } from '@/types/content';
import type { StudyAnswer, CaseTask } from '@/types/study';
import type {
  CaseAnswerDraftMap,
  CaseEvaluationSummary,
  CaseQuestionView
} from '@/features/cases/cases.selectors';

export interface CaseBoardProps {
  record: CaseRecord;
  task: CaseTask;
  targetLabels: string[];
  revealedClues: CaseRecord['clues'];
  nextClue?: CaseRecord['clues'][number];
  questionViews: CaseQuestionView[];
  drafts: CaseAnswerDraftMap;
  synthesisDraft: string;
  showSynthesis: boolean;
  isCompleted: boolean;
  evaluation: CaseEvaluationSummary;
  confidence: StudyAnswer['confidence'];
  onRevealNextClue: () => void;
  onToggleOption: (questionId: string, optionId: string, multiple: boolean) => void;
  onTextAnswerChange: (questionId: string, value: string) => void;
  onConfidenceChange: (value: StudyAnswer['confidence']) => void;
  onToggleSynthesis: () => void;
  onChangeSynthesis: (value: string) => void;
  onSubmitCase: () => void;
  onSkipCase: () => void;
  onPauseSession: () => void;
  onAbandonSession: () => void;
  onReturnToLibrary?: () => void;
  onStartNewCase?: () => void;
}

export function CaseBoard({
  record,
  task,
  targetLabels,
  revealedClues,
  nextClue,
  questionViews,
  drafts,
  synthesisDraft,
  showSynthesis,
  isCompleted,
  evaluation,
  confidence,
  onRevealNextClue,
  onToggleOption,
  onTextAnswerChange,
  onConfidenceChange,
  onToggleSynthesis,
  onChangeSynthesis,
  onSubmitCase,
  onSkipCase,
  onPauseSession,
  onAbandonSession,
  onReturnToLibrary,
  onStartNewCase
}: CaseBoardProps) {
  return (
    <div className="case-board-layout">
      <div className="stack gap-lg">
        <Card as="section" eyebrow="Detektivní spis" title={record.title} subtitle={task.prompt}>
          <div className="case-meta-row">
            <ProgressBadge label="Obtížnost" value={mapDifficultyLabel(record.difficulty)} tone="growing" />
            <ProgressBadge label="Indicie" value={`${revealedClues.length} / ${record.clues.length}`} tone="mastered" />
            <ProgressBadge label="Otázky" value={`${evaluation.answeredCount} / ${evaluation.totalQuestions}`} tone="needs-review" />
          </div>

          <p className="text-body">{record.goal}</p>

          <div className="button-row">
            <Button variant="secondary" onClick={onPauseSession}>
              Uložit a vrátit se později
            </Button>
            <Button variant="danger" onClick={onAbandonSession}>
              Zahodit rozehraný spis
            </Button>
          </div>
        </Card>

        <CaseClueList clues={revealedClues} nextClue={nextClue} onRevealNext={nextClue ? onRevealNextClue : undefined} />

        <Card
          as="section"
          eyebrow="Otázky"
          title="Průběžné ověření případu"
          subtitle="Každá odpověď pomáhá potvrdit nebo vyvrátit pracovní hypotézu nad spisem."
        >
          <div className="case-question-list">
            {questionViews.map((question) => {
              const draft = drafts[question.id];
              return (
                <article key={question.id} className="case-question-card stack gap-sm">
                  <div className="feedback-header">
                    <h3 className="subsection-title">{question.prompt}</h3>
                    <ProgressBadge
                      label={question.isCorrect ? 'zvládnuto' : question.isAnswered ? 'čeká oprava' : 'čeká odpověď'}
                      tone={question.isCorrect ? 'mastered' : question.isAnswered ? 'at-risk' : 'needs-review'}
                    />
                  </div>

                  {question.answerMode === 'short-text' ? (
                    <textarea
                      className="input case-text-answer"
                      value={draft?.textAnswer ?? ''}
                      onChange={(event) => onTextAnswerChange(question.id, event.target.value)}
                      rows={3}
                      placeholder="Napiš stručnou odpověď vlastními slovy."
                    />
                  ) : (
                    <div className="case-option-grid">
                      {question.options?.map((option) => {
                        const selected = draft?.selectedOptionIds?.includes(option.id) ?? false;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            className={['case-option-button', selected ? 'is-selected' : ''].filter(Boolean).join(' ')}
                            onClick={() => onToggleOption(question.id, option.id, question.answerMode === 'multi-choice')}
                          >
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="case-confidence-block stack gap-sm">
            <h3 className="subsection-title">Jak si jsi jistý nebo jistá řešením</h3>
            <div className="atlas-confidence-row">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={['atlas-confidence-button', confidence === value ? 'is-selected' : ''].filter(Boolean).join(' ')}
                  onClick={() => onConfidenceChange(value as StudyAnswer['confidence'])}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="button-row">
            <Button variant="secondary" onClick={onToggleSynthesis}>
              {showSynthesis ? 'Skrýt závěrečnou syntézu' : 'Otevřít závěrečnou syntézu'}
            </Button>
            <Button variant="ghost" onClick={onSkipCase}>
              Přeskočit spis
            </Button>
            <Button onClick={onSubmitCase} disabled={!evaluation.canSubmit}>
              Uzavřít spis a zobrazit výsledek
            </Button>
          </div>
        </Card>

        <CaseSummary
          title="Uzavření spisu"
          synthesisPrompt={task.synthesisPrompt}
          followUpExplanation={record.followUpExplanation}
          synthesisDraft={synthesisDraft}
          onChangeSynthesis={onChangeSynthesis}
          onToggleOpen={onToggleSynthesis}
          isOpen={showSynthesis}
          isCompleted={isCompleted}
          isSolved={evaluation.isSolved}
          correctCount={evaluation.correctCount}
          totalQuestions={evaluation.totalQuestions}
          onReturnToLibrary={onReturnToLibrary}
          onStartNewCase={onStartNewCase}
        />
      </div>

      <aside className="stack gap-lg">
        <Card as="section" eyebrow="Stav případu" title="Postup v tomto spisu">
          <ul className="feature-list">
            <li>{`Správně zodpovězeno: ${evaluation.correctCount}`}</li>
            <li>{`Minimálně je potřeba: ${evaluation.minimumCorrectQuestions}`}</li>
            <li>{`Povinné otázky: ${evaluation.requiredQuestionIds.length}`}</li>
          </ul>
        </Card>

        <Card as="section" eyebrow="Zaměření spisu" title="Cílové entity">
          <ul className="feature-list">
            {targetLabels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </Card>
      </aside>
    </div>
  );
}

function mapDifficultyLabel(value: CaseRecord['difficulty']): string {
  switch (value) {
    case 'introductory':
      return 'vstupní';
    case 'intermediate':
      return 'střední';
    case 'advanced':
      return 'pokročilá';
  }
}
