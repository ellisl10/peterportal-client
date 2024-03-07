import { FC } from 'react';
import './PrereqTree.scss';
import { Grid, Popup } from 'semantic-ui-react';
import type { Prerequisite, PrerequisiteTree } from 'peterportal-api-next-types';

import { CourseGQLData, CourseLookup } from '../../types/types';
import { Link } from 'react-router-dom';

interface NodeProps {
  node: string;
  label: string;
  content: string;
  index?: number;
}

type PrerequisiteNode = Prerequisite | PrerequisiteTree;

const phraseMapping = {
  AND: 'all of',
  OR: 'one of',
  NOT: 'none of',
};

const Node: FC<NodeProps> = (props) => {
  return (
    <div style={{ padding: '1px 0' }} className={`node-container ${props.node}`} key={props.index}>
      <Popup
        trigger={
          !props.label.startsWith('AP ') ? (
            <Link
              to={'/course/' + props.label.split('(')[0].replace(/\s+/g, '')}
              role="button"
              style={{ padding: '0.5rem' }}
              className={`node ui button`}
            >
              {props.label}
            </Link>
          ) : (
            <button style={{ padding: '0.5rem' }} className={`node ui button`}>{`${props.label}`}</button>
          )
        }
        content={props.content.length ? props.content : props.label}
        basic
        position="top center"
        wide="very"
      />
    </div>
  );
};

interface TreeProps {
  prerequisiteNames: CourseLookup;
  prerequisiteJSON: PrerequisiteNode;
  key?: string;
  index?: number;
}

const PrereqTreeNode: FC<TreeProps> = (props) => {
  const prerequisite = props.prerequisiteJSON;
  const isValueNode = Object.prototype.hasOwnProperty.call(prerequisite, 'prereqType');

  // if value is a string, render leaf node
  if (isValueNode) {
    const prereq = prerequisite as Prerequisite;
    return (
      <li key={props.index} className={'prerequisite-node'}>
        <Node
          label={`${prereq.courseId ?? prereq.examName ?? ''}${
            prereq?.minGrade ? ` (min grade = ${prereq?.minGrade})` : ''
          }${prereq?.coreq ? ' (coreq)' : ''}`}
          content={props.prerequisiteNames[prereq.courseId?.replace(/ /g, '') ?? prereq.examName ?? '']?.title ?? ''}
          node={'prerequisite-node'}
        />
      </li>
    );
  }
  // if value is an object, render the rest of the sub tree
  else {
    const prereqTree = prerequisite as Record<string, PrerequisiteNode[]>;
    return (
      <div style={{ margin: 'auto 0' }} className={'prerequisite-node'}>
        <div style={{ display: 'inline-flex', flexDirection: 'row', padding: '0.5rem 0' }}>
          <span style={{ margin: 'auto' }}>
            <div className={'prereq-branch'}>
              {
                Object.entries(phraseMapping).filter(([subtreeType]) =>
                  Object.prototype.hasOwnProperty.call(prerequisite, subtreeType),
                )[0][1]
              }
            </div>
          </span>
          <div className="prereq-clump">
            <ul className="prereq-list">
              {prereqTree[Object.keys(prerequisite)[0]].map((child, index) => (
                <PrereqTreeNode
                  key={`tree-${index}`}
                  prerequisiteNames={props.prerequisiteNames}
                  index={index}
                  prerequisiteJSON={child}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
};

interface PrereqProps extends CourseGQLData {}

const PrereqTree: FC<PrereqProps> = (props) => {
  const hasPrereqs = JSON.stringify(props.prerequisiteTree) !== '{}';
  const hasDependencies = Object.keys(props.dependencies).length !== 0;

  if (props.id === undefined) return <></>;
  else if (!hasPrereqs && !hasDependencies)
    return (
      <div className="prereq-text-box">
        <p>No Dependencies or Prerequisites!</p>
      </div>
    );
  return (
    <div>
      <Grid.Row className="prereq">
        <div
          style={{
            display: 'inline-flex',
            flexDirection: 'row',
            width: 'fit-content',
            justifyContent: 'center',
            margin: 'auto',
          }}
        >
          {/* Display dependencies */}
          {hasDependencies && (
            <>
              <ul style={{ padding: '0', display: 'flex' }}>
                <div className="dependency-list-branch">
                  {Object.values(props.dependencies).map((dependency, index) => (
                    <li key={`dependency-node-${index}`} className={'dependency-node'}>
                      <Node
                        label={`${dependency.department} ${dependency.courseNumber}`}
                        content={dependency.title}
                        node={'dependency-node'}
                      />
                    </li>
                  ))}
                </div>
              </ul>

              <div style={{ display: 'inline-flex', flexDirection: 'row', marginLeft: '0.5rem' }}>
                <span style={{ margin: 'auto 1rem' }}>
                  <div className="dependency-needs dependency-branch">needs</div>
                </span>
              </div>
            </>
          )}

          {/* {!hasDependencies && <div className='dependency-branch'>
            <p className='missing-tree'>
              No Dependencies!
            </p>
          </div>} */}

          {/* Display the class id */}
          <Node label={`${props.department} ${props.courseNumber}`} content={props.title} node={'course-node'} />

          {/* Spawns the root of the prerequisite tree */}
          {hasPrereqs && (
            <div style={{ display: 'flex' }}>
              <PrereqTreeNode prerequisiteNames={props.prerequisites} prerequisiteJSON={props.prerequisiteTree} />
            </div>
          )}

          {/* {!hasPrereqs && <div className='dependency-branch'>
            <p className='missing-tree'>
              No Prerequisites!
            </p>
          </div>} */}
        </div>
        {props.prerequisiteText !== '' && (
          <div
            className="prereq-text-box"
            style={{
              padding: '1em',
              marginTop: '2em',
            }}
          >
            <p>
              <b>Prerequisite: </b>
              {props.prerequisiteText}
            </p>
          </div>
        )}
      </Grid.Row>
    </div>
  );
};

export default PrereqTree;
