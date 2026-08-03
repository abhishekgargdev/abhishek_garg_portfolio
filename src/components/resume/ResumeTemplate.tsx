import type { ReactNode } from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/resume-types";
import {
  formatResumeDateRange,
  formatResumeMonthYear,
} from "@/lib/resume-types";

export type ResumeTemplateProps = {
  data: ResumeData;
};

const colors = {
  ink: "#18181b",
  muted: "#52525b",
  line: "#d4d4d8",
  accent: "#0f766e",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 9.5,
    fontFamily: "Helvetica",
    color: colors.ink,
    lineHeight: 1.35,
  },
  header: {
    marginBottom: 14,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.4,
    color: colors.ink,
  },
  title: {
    marginTop: 3,
    fontSize: 11,
    color: colors.accent,
    fontFamily: "Helvetica-Bold",
  },
  contactRow: {
    marginTop: 6,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  contactItem: {
    fontSize: 8.5,
    color: colors.muted,
    marginRight: 10,
    marginBottom: 2,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.ink,
    marginBottom: 5,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  summary: {
    color: colors.muted,
    fontSize: 9.5,
  },
  skillRow: {
    marginBottom: 3,
    flexDirection: "row",
  },
  skillLabel: {
    width: 92,
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
  },
  skillValue: {
    flex: 1,
    color: colors.muted,
  },
  entry: {
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  entryTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    flexGrow: 1,
    paddingRight: 10,
  },
  entryMeta: {
    fontSize: 8.5,
    color: colors.muted,
    marginTop: 1,
  },
  entryDate: {
    fontSize: 8.5,
    color: colors.muted,
  },
  bullet: {
    flexDirection: "row",
    marginTop: 2,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 10,
    color: colors.accent,
  },
  bulletText: {
    flex: 1,
    color: colors.muted,
  },
  techLine: {
    marginTop: 2,
    fontSize: 8.5,
    color: colors.ink,
  },
});

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Bullets({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <View>
      {items.map((item) => (
        <View key={item} style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function ResumeTemplate({ data }: ResumeTemplateProps) {
  const { about, experience, projects, education, certifications, achievements, skills } =
    data;

  const contactParts = [
    about.email,
    about.phone,
    about.location,
    ...about.socialLinks.map((link) => link.url),
  ].filter(Boolean);

  return (
    <Document
      title={`${about.name} Resume`}
      author={about.name}
      subject="Professional Resume"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{about.name}</Text>
          <Text style={styles.title}>{about.title}</Text>
          {contactParts.length > 0 ? (
            <View style={styles.contactRow}>
              {contactParts.map((part) => (
                <Text key={part} style={styles.contactItem}>
                  {part}
                </Text>
              ))}
            </View>
          ) : null}
        </View>

        {about.bio ? (
          <Section title="Professional Summary">
            <Text style={styles.summary}>{about.bio}</Text>
          </Section>
        ) : null}

        {skills.length > 0 ? (
          <Section title="Technical Skills">
            {skills.map((category) => (
              <View key={category.id} style={styles.skillRow}>
                <Text style={styles.skillLabel}>{category.categoryName}</Text>
                <Text style={styles.skillValue}>
                  {category.skills.map((skill) => skill.name).join(", ")}
                </Text>
              </View>
            ))}
          </Section>
        ) : null}

        {experience.length > 0 ? (
          <Section title="Work Experience">
            {experience.map((job) => (
              <View key={job.id} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {job.role} — {job.company}
                  </Text>
                  <Text style={styles.entryDate}>
                    {formatResumeDateRange(job.startDate, job.endDate)}
                  </Text>
                </View>
                {job.techStack.length > 0 ? (
                  <Text style={styles.techLine}>
                    Tech: {job.techStack.join(", ")}
                  </Text>
                ) : null}
                <Bullets items={job.bullets} />
              </View>
            ))}
          </Section>
        ) : null}

        {projects.length > 0 ? (
          <Section title="Independent Projects">
            {projects.map((project) => (
              <View key={project.id} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{project.title}</Text>
                </View>
                {project.description ? (
                  <Text style={styles.entryMeta}>{project.description}</Text>
                ) : null}
                {project.techStack.length > 0 ? (
                  <Text style={styles.techLine}>
                    Tech: {project.techStack.join(", ")}
                  </Text>
                ) : null}
                <Bullets items={project.bullets} />
              </View>
            ))}
          </Section>
        ) : null}

        {education.length > 0 ? (
          <Section title="Education">
            {education.map((item) => (
              <View key={item.id} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{item.degree}</Text>
                  <Text style={styles.entryDate}>{item.year}</Text>
                </View>
                <Text style={styles.entryMeta}>{item.institution}</Text>
                <Bullets items={item.highlights} />
              </View>
            ))}
          </Section>
        ) : null}

        {certifications.length > 0 ? (
          <Section title="Certifications">
            {certifications.map((item) => (
              <View key={item.id} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{item.title}</Text>
                  <Text style={styles.entryDate}>
                    {formatResumeMonthYear(item.date)}
                  </Text>
                </View>
                <Text style={styles.entryMeta}>{item.provider}</Text>
              </View>
            ))}
          </Section>
        ) : null}

        {achievements.length > 0 ? (
          <Section title="Achievements">
            {achievements.map((item) => (
              <View key={item.id} style={styles.entry} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{item.title}</Text>
                  <Text style={styles.entryDate}>
                    {formatResumeMonthYear(item.date)}
                  </Text>
                </View>
                <Text style={styles.entryMeta}>{item.description}</Text>
              </View>
            ))}
          </Section>
        ) : null}
      </Page>
    </Document>
  );
}

export default ResumeTemplate;
