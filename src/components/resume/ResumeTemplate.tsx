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
  ink: "#111111",
  muted: "#444444",
  line: "#cccccc",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 42,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: colors.ink,
    lineHeight: 1.38,
  },
  header: {
    marginBottom: 10,
    textAlign: "center",
  },
  name: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.ink,
    lineHeight: 1.15,
  },
  title: {
    marginTop: 4,
    fontSize: 10,
    color: colors.muted,
    fontFamily: "Helvetica",
    lineHeight: 1.25,
  },
  contactRow: {
    marginTop: 6,
    fontSize: 8.2,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 1.45,
  },
  contactItem: {
    color: colors.muted,
  },
  contactSeparator: {
    color: colors.line,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: colors.ink,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 0.75,
    borderBottomColor: colors.line,
  },
  summary: {
    color: colors.muted,
    fontSize: 9,
    textAlign: "justify",
  },
  skillBullet: {
    flexDirection: "row",
    marginBottom: 2.5,
    paddingLeft: 2,
  },
  skillDot: {
    width: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
  },
  skillText: {
    flex: 1,
    color: colors.muted,
    fontSize: 9,
  },
  skillLabel: {
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
  },
  entry: {
    marginBottom: 7,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  entryTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    flexGrow: 1,
    paddingRight: 12,
    color: colors.ink,
  },
  entryDate: {
    fontSize: 8.5,
    color: colors.muted,
    fontFamily: "Helvetica-Bold",
    flexShrink: 0,
  },
  entryCompany: {
    fontSize: 8.5,
    color: colors.muted,
    marginTop: 1,
  },
  bullet: {
    flexDirection: "row",
    marginTop: 2,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 10,
    color: colors.ink,
  },
  bulletText: {
    flex: 1,
    color: colors.muted,
    fontSize: 9,
    textAlign: "justify",
  },
  projectTitleLine: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: colors.ink,
    marginBottom: 1,
  },
  projectTech: {
    fontFamily: "Helvetica",
    color: colors.muted,
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
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function formatContactUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function ResumeTemplate({ data }: ResumeTemplateProps) {
  const {
    about,
    experience,
    projects,
    education,
    certifications,
    achievements,
    skills,
  } = data;

  const contactParts: string[] = [];
  if (about.location) contactParts.push(about.location);
  if (about.phone) contactParts.push(about.phone);
  if (about.email) contactParts.push(about.email);
  if (about.portfolioUrl) contactParts.push(formatContactUrl(about.portfolioUrl));
  for (const link of about.socialLinks) {
    if (link.url) contactParts.push(formatContactUrl(link.url));
  }

  const certificationBullets = certifications.map((item) => {
    const date = item.date ? ` (${formatResumeMonthYear(item.date)})` : "";
    return `${item.title} — ${item.provider}${date}`;
  });

  const achievementBullets = achievements.map((item) => {
    if (item.description) return `${item.title} — ${item.description}`;
    return item.title;
  });

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
            <Text style={styles.contactRow}>
              {contactParts.map((part, index) => (
                <Text key={`${part}-${index}`} style={styles.contactItem}>
                  {index > 0 ? <Text style={styles.contactSeparator}>  |  </Text> : null}
                  {part}
                </Text>
              ))}
            </Text>
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
              <View key={category.id} style={styles.skillBullet}>
                <Text style={styles.skillDot}>•</Text>
                <Text style={styles.skillText}>
                  <Text style={styles.skillLabel}>{category.categoryName}: </Text>
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
                  <Text style={styles.entryTitle}>{job.role}</Text>
                  <Text style={styles.entryDate}>
                    {formatResumeDateRange(job.startDate, job.endDate)}
                  </Text>
                </View>
                {job.company ? (
                  <Text style={styles.entryCompany}>{job.company}</Text>
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
                <Text style={styles.projectTitleLine}>
                  {project.title}
                  {project.techStack.length > 0 ? (
                    <Text style={styles.projectTech}>
                      {" "}
                      | {project.techStack.join(", ")}
                    </Text>
                  ) : null}
                </Text>
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
                {item.institution ? (
                  <Text style={styles.entryCompany}>{item.institution}</Text>
                ) : null}
                <Bullets items={item.highlights} />
              </View>
            ))}
          </Section>
        ) : null}

        {certificationBullets.length > 0 ? (
          <Section title="Certifications">
            <Bullets items={certificationBullets} />
          </Section>
        ) : null}

        {achievementBullets.length > 0 ? (
          <Section title="Achievements & Awards">
            <Bullets items={achievementBullets} />
          </Section>
        ) : null}

        {about.openSourceContributions && about.openSourceContributions.length > 0 ? (
          <Section title="Open Source Contributions">
            <Bullets items={about.openSourceContributions} />
          </Section>
        ) : null}
      </Page>
    </Document>
  );
}

export default ResumeTemplate;
